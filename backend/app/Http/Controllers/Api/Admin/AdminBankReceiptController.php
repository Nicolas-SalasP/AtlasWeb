<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Order\Exceptions\InvalidOrderTransitionException;
use App\Domain\Order\Exceptions\OrderNotFoundException;
use App\Domain\Payment\Exceptions\BankReceiptAlreadyMatchedException;
use App\Domain\Payment\Exceptions\BankReceiptNotFoundException;
use App\Domain\Payment\Services\BankReceiptService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\ManualMatchBankReceiptRequest;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\Payment\BankReceiptResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminBankReceiptController extends Controller
{
    public function __construct(private readonly BankReceiptService $bankReceiptService)
    {
    }

    public function unmatched(Request $request): JsonResponse
    {
        $receipts = $this->bankReceiptService->listUnmatched();

        return response()->json(
            BankReceiptResource::collection($receipts)->toArray($request)
        );
    }

    public function manualMatch(ManualMatchBankReceiptRequest $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $orderId = (int) $request->validated()['order_id'];

        try {
            $order = $this->bankReceiptService->associateManually(
                receiptId: $id,
                orderId: $orderId,
                actorUserId: $actor?->id,
                actorName: $actor?->name,
            );
        } catch (BankReceiptNotFoundException) {
            return response()->json(['message' => 'Comprobante no encontrado'], 404);
        } catch (OrderNotFoundException) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        } catch (BankReceiptAlreadyMatchedException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (InvalidOrderTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error crítico vinculando comprobante bancario: ' . $e->getMessage());

            return response()->json(['message' => 'Ocurrió un error interno al intentar procesar la vinculación.'], 500);
        }

        return response()->json([
            'message' => 'Comprobante asociado exitosamente',
            'order'   => (new OrderResource($order))->toArray($request),
        ]);
    }
}
