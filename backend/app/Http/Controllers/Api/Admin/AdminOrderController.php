<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Order\DTOs\UpdateOrderData;
use App\Domain\Order\Exceptions\InvalidOrderTransitionException;
use App\Domain\Order\Exceptions\OrderNotFoundException;
use App\Domain\Order\Services\OrderService;
use App\Domain\Order\Support\OrderStateMachine;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Resources\Order\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminOrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 0);
        $filters = $request->only(['status', 'from', 'to', 'q']);

        if ($perPage > 0) {
            $perPage = max(1, min($perPage, 100));
            $paginator = $this->orderService->paginateAll($filters, $perPage);
            $paginator->setCollection(
                $paginator->getCollection()->map(fn ($order) => (new OrderResource($order))->toArray($request))
            );

            return response()->json($paginator);
        }

        $orders = $this->orderService->listAll($filters);

        return response()->json(
            OrderResource::collection($orders)->toArray($request)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->findByIdOrFail($id);
        } catch (OrderNotFoundException) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        }

        $order->load(['user', 'items.product', 'statusLogs.user']);

        return response()->json(
            (new OrderResource($order))->toArray($request)
        );
    }

    public function update(UpdateOrderRequest $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $data = UpdateOrderData::fromValidated(
            $request->validated(),
            actorUserId: $actor?->id,
            actorName: $actor?->name
        );

        try {
            $order = $this->orderService->update($id, $data);
        } catch (OrderNotFoundException) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        } catch (InvalidOrderTransitionException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'allowed' => array_map(
                    fn ($status) => $status->value,
                    OrderStateMachine::allowedTransitions($e->from)
                ),
            ], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando orden {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al actualizar la orden'], 500);
        }

        return response()->json([
            'message' => 'Orden actualizada exitosamente',
            'order'   => (new OrderResource($order))->toArray($request),
        ]);
    }
}
