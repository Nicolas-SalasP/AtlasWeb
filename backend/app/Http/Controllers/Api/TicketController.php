<?php

namespace App\Http\Controllers\Api;

use App\Domain\Ticket\DTOs\CreateTicketData;
use App\Domain\Ticket\DTOs\ReplyTicketData;
use App\Domain\Ticket\Exceptions\AttachmentUploadException;
use App\Domain\Ticket\Exceptions\TicketNotFoundException;
use App\Domain\Ticket\Exceptions\TicketReplyValidationException;
use App\Domain\Ticket\Exceptions\UnauthorizedTicketAccessException;
use App\Domain\Ticket\Services\TicketService;
use App\Domain\User\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\ReplyTicketRequest;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Resources\Ticket\TicketMessageResource;
use App\Http\Resources\Ticket\TicketResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $ticketService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $tickets = $this->ticketService->listForUser($user->id);

        return response()->json(
            TicketResource::collection($tickets)->toArray($request)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $ticket = $this->ticketService->findFor($id, $user);
        } catch (TicketNotFoundException) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        } catch (UnauthorizedTicketAccessException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json(
            (new TicketResource($ticket))->toArray($request)
        );
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $files = $request->file('attachments') ?? [];
        $data = CreateTicketData::fromValidated($request->validated(), $files);

        try {
            $ticket = $this->ticketService->create($data, $user->id);
        } catch (TicketReplyValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (AttachmentUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error creando ticket: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo crear el ticket'], 500);
        }

        return response()->json(
            (new TicketResource($ticket))->toArray($request),
            201
        );
    }

    public function reply(ReplyTicketRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $files = $request->file('attachments') ?? [];
        $data = ReplyTicketData::fromValidated($request->validated(), $files);

        try {
            $message = $this->ticketService->reply($id, $data, $user);
        } catch (TicketNotFoundException) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        } catch (UnauthorizedTicketAccessException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        } catch (TicketReplyValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (AttachmentUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error respondiendo ticket: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo agregar la respuesta'], 500);
        }

        return response()->json(
            (new TicketMessageResource($message))->toArray($request),
            201
        );
    }
}
