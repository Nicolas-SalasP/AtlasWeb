<?php

namespace App\Domain\Ticket\Services;

use App\Domain\Ticket\DTOs\CreateTicketData;
use App\Domain\Ticket\DTOs\ReplyTicketData;
use App\Domain\Ticket\Enums\TicketStatus;
use App\Domain\Ticket\Exceptions\AttachmentUploadException;
use App\Domain\Ticket\Exceptions\InvalidTicketTransitionException;
use App\Domain\Ticket\Exceptions\TicketNotFoundException;
use App\Domain\Ticket\Exceptions\TicketReplyValidationException;
use App\Domain\Ticket\Exceptions\UnauthorizedTicketAccessException;
use App\Domain\Ticket\Models\Ticket;
use App\Domain\Ticket\Models\TicketMessage;
use App\Domain\Ticket\Support\TicketStateMachine;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class TicketService
{
    public function __construct(private readonly TicketAttachmentService $attachmentService)
    {
    }

    public function paginateForUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Ticket::with(['assignee'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function paginateAll(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = Ticket::with(['user', 'assignee'])
            ->orderByRaw("FIELD(status, 'nuevo', 'abierto', 'esperando_cliente', 'resuelto', 'cerrado')")
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function listForUser(int $userId): Collection
    {
        return Ticket::with(['assignee'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function listAll(array $filters = []): Collection
    {
        $query = Ticket::with(['user', 'assignee'])
            ->orderByRaw("FIELD(status, 'nuevo', 'abierto', 'esperando_cliente', 'resuelto', 'cerrado')")
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        return $query->get();
    }

    public function findFor(int $ticketId, User $viewer): Ticket
    {
        $ticket = Ticket::with(['messages.user', 'user', 'assignee'])->find($ticketId);

        if (!$ticket) {
            throw new TicketNotFoundException($ticketId);
        }

        $isAdmin = (int) $viewer->role_id === 1;
        $isOwner = (int) $ticket->user_id === (int) $viewer->id;

        if (!$isAdmin && !$isOwner) {
            throw new UnauthorizedTicketAccessException();
        }

        return $ticket;
    }

    public function create(CreateTicketData $data, int $userId): Ticket
    {
        if ($data->firstMessage === '') {
            throw new TicketReplyValidationException('El mensaje inicial del ticket no puede estar vacío.');
        }

        $uploaded = [];

        try {
            if (!empty($data->attachments)) {
                $uploaded = $this->attachmentService->uploadAll($data->attachments);
            }

            return DB::transaction(function () use ($data, $userId, $uploaded) {
                $ticket = Ticket::create([
                    'ticket_code' => $this->generateTicketCode(),
                    'user_id'     => $userId,
                    'subject'     => $data->subject,
                    'category'    => $data->category,
                    'priority'    => $data->priority,
                    'status'      => TicketStatus::Nuevo,
                ]);

                TicketMessage::create([
                    'ticket_id'   => $ticket->id,
                    'user_id'     => $userId,
                    'message'     => $data->firstMessage,
                    'attachments' => !empty($uploaded) ? $uploaded : null,
                ]);

                return $ticket->load(['messages.user', 'user', 'assignee']);
            });
        } catch (Throwable $e) {
            if (!empty($uploaded)) {
                $this->attachmentService->deletePhysical($uploaded);
            }
            throw $e;
        }
    }

    public function reply(int $ticketId, ReplyTicketData $data, User $author): TicketMessage
    {
        $ticket = Ticket::find($ticketId);

        if (!$ticket) {
            throw new TicketNotFoundException($ticketId);
        }

        $isAdmin = (int) $author->role_id === 1;
        $isOwner = (int) $ticket->user_id === (int) $author->id;

        if (!$isAdmin && !$isOwner) {
            throw new UnauthorizedTicketAccessException('Acceso denegado. No puedes responder a un ticket ajeno.');
        }

        if ($data->message === null && empty($data->attachments)) {
            throw new TicketReplyValidationException('Debes ingresar un mensaje o adjuntar al menos un archivo.');
        }

        $uploaded = [];

        try {
            if (!empty($data->attachments)) {
                $uploaded = $this->attachmentService->uploadAll($data->attachments);
            }

            return DB::transaction(function () use ($ticket, $author, $data, $uploaded, $isAdmin) {
                $message = TicketMessage::create([
                    'ticket_id'   => $ticket->id,
                    'user_id'     => $author->id,
                    'message'     => $data->message ?? '',
                    'attachments' => !empty($uploaded) ? $uploaded : null,
                ]);

                $this->advanceStatusOnReply($ticket, $isAdmin);

                return $message->load('user');
            });
        } catch (AttachmentUploadException $e) {
            throw $e;
        } catch (Throwable $e) {
            if (!empty($uploaded)) {
                $this->attachmentService->deletePhysical($uploaded);
            }
            throw $e;
        }
    }

    public function changeStatus(int $ticketId, TicketStatus $newStatus): Ticket
    {
        return DB::transaction(function () use ($ticketId, $newStatus) {
            $ticket = Ticket::lockForUpdate()->find($ticketId);

            if (!$ticket) {
                throw new TicketNotFoundException($ticketId);
            }

            if ($ticket->status === $newStatus) {
                return $ticket->load(['messages.user', 'user', 'assignee']);
            }

            if (!TicketStateMachine::canTransition($ticket->status, $newStatus)) {
                throw new InvalidTicketTransitionException($ticket->status, $newStatus);
            }

            $ticket->status = $newStatus;
            $ticket->save();

            return $ticket->load(['messages.user', 'user', 'assignee']);
        });
    }

    public function assign(int $ticketId, ?int $assigneeUserId): Ticket
    {
        return DB::transaction(function () use ($ticketId, $assigneeUserId) {
            $ticket = Ticket::lockForUpdate()->find($ticketId);

            if (!$ticket) {
                throw new TicketNotFoundException($ticketId);
            }

            if ($assigneeUserId !== null) {
                $exists = User::where('id', $assigneeUserId)
                    ->where('role_id', 1)
                    ->exists();

                if (!$exists) {
                    throw new TicketReplyValidationException('El usuario asignado debe ser un administrador válido.');
                }
            }

            $ticket->assigned_to = $assigneeUserId;
            $ticket->save();

            return $ticket->load(['messages.user', 'user', 'assignee']);
        });
    }

    private function advanceStatusOnReply(Ticket $ticket, bool $isAdmin): void
    {
        $current = $ticket->status;
        $target = null;

        if ($isAdmin) {
            if ($current === TicketStatus::Nuevo) {
                $target = TicketStatus::Abierto;
            } elseif ($current === TicketStatus::Abierto) {
                $target = TicketStatus::EsperandoCliente;
            }
        } else {
            if ($current === TicketStatus::EsperandoCliente) {
                $target = TicketStatus::Abierto;
            }
        }

        if ($target === null || $target === $current) {
            return;
        }

        if (!TicketStateMachine::canTransition($current, $target)) {
            return;
        }

        $ticket->status = $target;
        $ticket->save();
    }

    private function generateTicketCode(): string
    {
        do {
            $candidate = 'TK-' . strtoupper(Str::random(6));
        } while (Ticket::where('ticket_code', $candidate)->exists());

        return $candidate;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['status'])) {
            $rawValues = is_array($filters['status'])
                ? $filters['status']
                : explode(',', (string) $filters['status']);

            $valid = [];
            foreach ($rawValues as $raw) {
                $case = TicketStatus::tryFrom(trim((string) $raw));
                if ($case !== null) {
                    $valid[] = $case->value;
                }
            }

            if (!empty($valid)) {
                $query->whereIn('status', $valid);
            }
        }

        if (!empty($filters['category'])) {
            $query->where('category', (string) $filters['category']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', (string) $filters['priority']);
        }

        if (array_key_exists('assigned_to', $filters)
            && $filters['assigned_to'] !== ''
            && $filters['assigned_to'] !== null
        ) {
            $query->where('assigned_to', (int) $filters['assigned_to']);
        }

        if (!empty($filters['q'])) {
            $needle = trim((string) $filters['q']);
            $query->where(function (Builder $q) use ($needle) {
                $q->where('ticket_code', 'like', "%{$needle}%")
                    ->orWhere('subject', 'like', "%{$needle}%")
                    ->orWhereHas('user', function (Builder $u) use ($needle) {
                        $u->where('name', 'like', "%{$needle}%")
                            ->orWhere('email', 'like', "%{$needle}%");
                    });
            });
        }
    }
}
