<?php

namespace App\Http\Controllers;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Exceptions\InvalidOrderTransitionException;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Services\OrderService;
use App\Http\Resources\Order\OrderResource;
use App\Models\BankReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class BankReceiptController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function getUnmatched(): JsonResponse
    {
        return response()->json(
            BankReceipt::where('status', 'unmatched')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function manualMatch(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $receipt = BankReceipt::find($id);
        if (!$receipt) {
            return response()->json(['message' => 'Comprobante no encontrado'], 404);
        }

        if ($receipt->status === 'matched') {
            return response()->json([
                'message' => 'Rechazado: Este comprobante ya ha sido vinculado a una orden anteriormente.',
            ], 422);
        }

        $order = Order::find($request->input('order_id'));
        if (!$order) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        }

        if (in_array($order->status, [OrderStatus::Paid, OrderStatus::Cancelled, OrderStatus::Refunded], true)) {
            return response()->json([
                'message' => "No se puede vincular: La orden ya se encuentra en estado '{$order->status->value}'.",
            ], 422);
        }

        $actor = $request->user();
        $reason = "Asociación manual. Transacción: {$receipt->transaction_number}. Glosa: " . ($receipt->glosa ?? 'Sin glosa');

        try {
            $updatedOrder = DB::transaction(function () use ($receipt, $order, $actor, $reason) {
                $receipt->update([
                    'order_id' => $order->id,
                    'status'   => 'matched',
                ]);

                return $this->orderService->markAsPaidFromBankTransfer(
                    order: $order,
                    transferReference: (string) $receipt->transaction_number,
                    transferDate: $receipt->transfer_date,
                    actorUserId: $actor?->id,
                    actorName: $actor?->name,
                    auditReason: $reason,
                );
            });
        } catch (InvalidOrderTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error crítico vinculando comprobante bancario: ' . $e->getMessage());

            return response()->json([
                'message' => 'Ocurrió un error interno al intentar procesar la vinculación.',
            ], 500);
        }

        return response()->json([
            'message' => 'Comprobante asociado exitosamente',
            'order'   => (new OrderResource($updatedOrder))->toArray($request),
        ]);
    }
}
