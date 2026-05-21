<?php

namespace App\Domain\Payment\Support;

use App\Domain\Order\Models\Order;
use App\Domain\Payment\DTOs\BankTransferData;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

final class BankTransferMatcher
{
    public static function matchByGlosa(BankTransferData $transfer, Collection $candidates): ?Order
    {
        if ($transfer->glosa === null || $transfer->glosa === '') {
            return null;
        }

        $glosa = strtoupper($transfer->glosa);

        if (preg_match('/(ORD-[A-Z0-9]{8})/', $glosa, $matches)) {
            $orderNumber = $matches[1];
            $byNumber = $candidates->first(fn (Order $order) =>
                $order->order_number === $orderNumber
                && (int) $order->total === $transfer->amount
            );

            if ($byNumber !== null) {
                return $byNumber;
            }
        }

        if (preg_match('/(?:PEDIDO|ORDEN|#|NRO)\s*(\d+)/', $glosa, $matches)) {
            $rawId = (int) $matches[1];
            $byId = $candidates->first(fn (Order $order) =>
                (int) $order->id === $rawId
                && (int) $order->total === $transfer->amount
            );

            if ($byId !== null) {
                return $byId;
            }
        }

        return null;
    }

    public static function matchByAmountAndIdentity(BankTransferData $transfer, Collection $candidates): ?Order
    {
        if ($transfer->amount <= 0) {
            return null;
        }

        foreach ($candidates as $order) {
            if ((int) $order->total !== $transfer->amount) {
                continue;
            }

            $orderCreated = CarbonImmutable::parse($order->created_at);
            if ($transfer->transferDate->isBefore($orderCreated->subMinutes(30))) {
                continue;
            }

            if ($transfer->rutPrefix !== null) {
                $orderRutRaw = str_replace('.', '', (string) ($order->customer_data['rut'] ?? ''));
                if ($orderRutRaw !== '' && str_starts_with($orderRutRaw, $transfer->rutPrefix)) {
                    return $order;
                }
            }

            if ($transfer->senderName !== null) {
                $customerName = $order->customer_data['nombre']
                    ?? $order->user?->name
                    ?? '';

                if (NameMatcher::isFuzzyMatch($transfer->senderName, (string) $customerName)) {
                    return $order;
                }
            }
        }

        return null;
    }
}
