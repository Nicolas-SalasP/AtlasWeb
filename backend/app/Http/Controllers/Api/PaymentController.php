<?php

namespace App\Http\Controllers\Api;

use App\Domain\Order\Exceptions\InvalidOrderTransitionException;
use App\Domain\Order\Exceptions\OrderNotFoundException;
use App\Domain\Payment\Exceptions\OrderNotPayableException;
use App\Domain\Payment\Exceptions\PaymentMethodDisabledException;
use App\Domain\Payment\Exceptions\WebpayException;
use App\Domain\Payment\Services\CheckoutService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitWebpayRequest;
use App\Http\Requests\Payment\PayWithTransferRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService)
    {
    }

    public function initWebpay(InitWebpayRequest $request): JsonResponse
    {
        $orderId = (int) $request->validated()['order_id'];

        try {
            $result = $this->checkoutService->startWebpay(
                orderId: $orderId,
                sessionId: $request->session()->getId(),
                returnUrl: url('/api/webpay/return'),
            );
        } catch (PaymentMethodDisabledException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (OrderNotFoundException) {
            return response()->json(['error' => 'Orden no encontrada'], 404);
        } catch (OrderNotPayableException | InvalidOrderTransitionException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (WebpayException $e) {
            Log::error('Webpay Init Error: ' . $e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        } catch (Throwable $e) {
            Log::error('Webpay Init Unexpected: ' . $e->getMessage());

            return response()->json(['error' => 'Error iniciando Webpay'], 500);
        }

        return response()->json([
            'url'   => $result['url'],
            'token' => $result['token'],
        ]);
    }

    public function payWithTransfer(PayWithTransferRequest $request): JsonResponse
    {
        $orderId = (int) $request->validated()['order_id'];

        try {
            $result = $this->checkoutService->registerTransferIntent($orderId);
        } catch (OrderNotFoundException) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        } catch (OrderNotPayableException | InvalidOrderTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error registrando intención de transferencia: ' . $e->getMessage());

            return response()->json(['error' => 'No se pudo procesar la intención de pago'], 500);
        }

        return response()->json([
            'message'      => 'Intención de transferencia registrada',
            'bank_details' => $result['bank_details'],
        ]);
    }

    public function commitWebpay(Request $request): RedirectResponse
    {
        $token = $request->input('token_ws') ?? $request->input('TBK_TOKEN');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if (!$token || $request->input('TBK_ACCION') === 'anular') {
            return redirect($frontendUrl . '/checkout/failure?reason=cancelled');
        }

        try {
            $order = $this->checkoutService->commitWebpay((string) $token);
        } catch (OrderNotPayableException) {
            return redirect($frontendUrl . '/checkout/failure?reason=order_not_found');
        } catch (Throwable $e) {
            Log::error('Error Webpay Commit: ' . $e->getMessage());

            return redirect($frontendUrl . '/checkout/failure?reason=exception');
        }

        $isPaid = $order->status->value === 'paid';

        return redirect(
            $frontendUrl
            . ($isPaid ? '/checkout/success' : '/checkout/failure')
            . '?order=' . $order->order_number
        );
    }
}
