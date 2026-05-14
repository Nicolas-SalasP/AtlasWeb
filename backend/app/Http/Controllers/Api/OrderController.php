<?php

namespace App\Http\Controllers\Api;

use App\Domain\Catalog\Exceptions\OfferingNotFoundException;
use App\Domain\Order\DTOs\CreateOrderData;
use App\Domain\Order\Exceptions\OrderNotFoundException;
use App\Domain\Order\Exceptions\UnauthorizedOrderAccessException;
use App\Domain\Order\Services\OrderService;
use App\Domain\Product\Exceptions\InsufficientStockException;
use App\Domain\Product\Exceptions\ProductNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\Order\OrderResource;
use App\Mail\OrderPlaced;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $paginator = $this->orderService->paginateForUser($user->id, $perPage);
        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($order) => (new OrderResource($order))->toArray($request))
        );

        return response()->json($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $order = $this->orderService->findFor($id, $user);
        } catch (OrderNotFoundException) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        } catch (UnauthorizedOrderAccessException) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return response()->json((new OrderResource($order))->toArray($request));
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        $data = CreateOrderData::fromArray($request->validated(), $user?->id, $request->ip());

        try {
            $order = $this->orderService->create($data);
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'product' => $e->productName,
                'available' => $e->available,
            ], 400);
        } catch (ProductNotFoundException | OfferingNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (Throwable $e) {
            Log::error('Critical Order Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al procesar la orden',
                'error'   => 'Ocurrió un problema interno. Por favor intenta nuevamente.',
            ], 500);
        }

        $clientEmail = $order->customer_data['email'] ?? null;
        if ($clientEmail) {
            try {
                Mail::to($clientEmail)->send(new OrderPlaced($order));
            } catch (Throwable $e) {
                Log::error('Error enviando email confirmación: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message'            => 'Orden creada exitosamente',
            'order_id'           => $order->id,
            'order_number'       => $order->order_number,
            'assigned_user_id'   => $order->user_id,
            'is_guest_checkout'  => is_null($order->user_id),
            'order'              => (new OrderResource($order))->toArray(request()),
        ], 201);
    }
}
