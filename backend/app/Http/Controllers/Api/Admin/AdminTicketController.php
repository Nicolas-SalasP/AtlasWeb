<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Ticket\Enums\TicketStatus;
use App\Domain\Ticket\Exceptions\InvalidTicketTransitionException;
use App\Domain\Ticket\Exceptions\TicketNotFoundException;
use App\Domain\Ticket\Exceptions\TicketReplyValidationException;
use App\Domain\Ticket\Services\TicketService;
use App\Domain\Ticket\Support\TicketStateMachine;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\AssignTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Http\Resources\Ticket\TicketResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminTicketController extends Controller
{
    public function __construct(private readonly TicketService $ticketService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 0);
        $filters = $request->only(['status', 'category', 'priority', 'assigned_to', 'q']);

        if ($perPage > 0) {
            $perPage = max(1, min($perPage, 100));
            $paginator = $this->ticketService->paginateAll($filters, $perPage);
            $paginator->setCollection(
                $paginator->getCollection()->map(fn ($ticket) => (new TicketResource($ticket))->toArray($request))
            );

            return response()->json($paginator);
        }

        $tickets = $this->ticketService->listAll($filters);

        return response()->json(
            TicketResource::collection($tickets)->toArray($request)
        );
    }

    public function updateStatus(UpdateTicketStatusRequest $request, int $id): JsonResponse
    {
        $newStatus = TicketStatus::from((string) $request->validated()['status']);

        try {
            $ticket = $this->ticketService->changeStatus($id, $newStatus);
        } catch (TicketNotFoundException) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        } catch (InvalidTicketTransitionException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'allowed' => array_map(
                    fn ($status) => $status->value,
                    TicketStateMachine::allowedTransitions($e->from)
                ),
            ], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando estado de ticket {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al actualizar el ticket'], 500);
        }

        return response()->json(
            (new TicketResource($ticket))->toArray($request)
        );
    }

    public function assign(AssignTicketRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $assigneeId = array_key_exists('assigned_to', $validated) && $validated['assigned_to'] !== null
            ? (int) $validated['assigned_to']
            : null;

        try {
            $ticket = $this->ticketService->assign($id, $assigneeId);
        } catch (TicketNotFoundException) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        } catch (TicketReplyValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error("Error asignando ticket {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al asignar el ticket'], 500);
        }

        return response()->json(
            (new TicketResource($ticket))->toArray($request)
        );
    }
}
