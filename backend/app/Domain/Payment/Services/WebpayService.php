<?php

namespace App\Domain\Payment\Services;

use App\Domain\Order\Models\Order;
use App\Domain\Payment\DTOs\WebpayInitResult;
use App\Domain\Payment\Exceptions\WebpayException;
use App\Domain\Payment\Support\TransbankOptionsResolver;
use Throwable;
use Transbank\Webpay\WebpayPlus\Responses\TransactionCommitResponse;
use Transbank\Webpay\WebpayPlus\Transaction;

class WebpayService
{
    public function isEnabled(): bool
    {
        return TransbankOptionsResolver::isEnabled();
    }

    public function createTransaction(Order $order, string $sessionId, string $returnUrl): WebpayInitResult
    {
        try {
            $amount = (int) round((float) $order->total);
            $buyOrder = 'ORD-' . $order->id . '-' . time();

            $transaction = new Transaction(TransbankOptionsResolver::resolve());
            $response = $transaction->create($buyOrder, $sessionId, $amount, $returnUrl);

            return new WebpayInitResult(
                url: $response->getUrl(),
                token: $response->getToken(),
            );
        } catch (Throwable $e) {
            throw new WebpayException('Error iniciando Webpay: ' . $e->getMessage(), $e);
        }
    }

    public function commit(string $token): TransactionCommitResponse
    {
        try {
            $transaction = new Transaction(TransbankOptionsResolver::resolve());

            return $transaction->commit($token);
        } catch (Throwable $e) {
            throw new WebpayException('Error confirmando Webpay: ' . $e->getMessage(), $e);
        }
    }

    public function responseToArray(TransactionCommitResponse $response): array
    {
        $serialized = json_encode($response);
        if ($serialized === false) {
            return [];
        }

        $decoded = json_decode($serialized, true);

        return is_array($decoded) ? $decoded : [];
    }
}
