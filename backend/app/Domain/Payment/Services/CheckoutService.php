<?php

namespace App\Domain\Payment\Services;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Services\OrderService;
use App\Domain\Payment\DTOs\WebpayInitResult;
use App\Domain\Payment\Enums\PaymentMethod;
use App\Domain\Payment\Exceptions\OrderNotPayableException;
use App\Domain\Payment\Exceptions\PaymentMethodDisabledException;
use App\Domain\Payment\Support\BankDetailsResolver;
use App\Mail\OrderPlaced;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CheckoutService
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly WebpayService $webpayService,
    ) {
    }

    public function startWebpay(int $orderId, string $sessionId, string $returnUrl): array
    {
        if (!$this->webpayService->isEnabled()) {
            throw new PaymentMethodDisabledException(PaymentMethod::Webpay);
        }

        $order = $this->orderService->findByIdOrFail($orderId);
        $this->ensurePayable($order);

        $init = $this->webpayService->createTransaction($order, $sessionId, $returnUrl);

        $this->orderService->attachPaymentMethod(
            orderId: $order->id,
            method: PaymentMethod::Webpay,
            transactionToken: $init->token,
        );

        return [
            'url'   => $init->url,
            'token' => $init->token,
            'init'  => $init,
        ];
    }

    public function commitWebpay(string $token): Order
    {
        $order = $this->orderService->findByTransactionToken($token);

        if ($order === null) {
            throw new OrderNotPayableException(OrderStatus::Cancelled);
        }

        if ($order->status === OrderStatus::Paid) {
            return $order->load(['user', 'items.product', 'statusLogs.user']);
        }

        $response = $this->webpayService->commit($token);
        $payload = $this->webpayService->responseToArray($response);

        if ($response->isApproved()) {
            return $this->orderService->markAsPaidFromWebpay($order, $payload);
        }

        return $this->orderService->failWebpayPayment($order, $payload);
    }

    public function registerTransferIntent(int $orderId): array
    {
        $order = $this->orderService->findByIdOrFail($orderId);
        $this->ensurePayable($order);

        $order = $this->orderService->attachPaymentMethod(
            orderId: $order->id,
            method: PaymentMethod::Transfer,
        );

        $bankDetails = BankDetailsResolver::resolve();

        $this->dispatchTransferEmail($order, $bankDetails);

        return [
            'order'        => $order,
            'bank_details' => $bankDetails,
        ];
    }

    private function ensurePayable(Order $order): void
    {
        if (in_array($order->status, [OrderStatus::Paid, OrderStatus::Cancelled, OrderStatus::Refunded], true)) {
            throw new OrderNotPayableException($order->status);
        }
    }

    private function dispatchTransferEmail(Order $order, array $bankDetails): void
    {
        $clientEmail = $order->customer_data['email'] ?? null;

        if (!$clientEmail) {
            return;
        }

        try {
            Mail::to($clientEmail)->send(new OrderPlaced($order, $bankDetails));
        } catch (Throwable $e) {
            Log::error('Error enviando correo transferencia: ' . $e->getMessage());
        }
    }
}
