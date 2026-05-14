<?php

namespace App\Domain\Order\Support;

use App\Domain\Order\Enums\OrderStatus;

final class OrderStateMachine
{
    private const TRANSITIONS = [
        'pending'   => ['paid', 'cancelled'],
        'paid'      => ['preparing', 'cancelled', 'refunded'],
        'preparing' => ['shipped', 'cancelled', 'refunded'],
        'shipped'   => ['delivered', 'refunded'],
        'delivered' => ['refunded'],
        'cancelled' => [],
        'refunded'  => [],
    ];

    public static function canTransition(OrderStatus $from, OrderStatus $to): bool
    {
        return in_array($to->value, self::TRANSITIONS[$from->value] ?? [], true);
    }

    public static function allowedTransitions(OrderStatus $from): array
    {
        return array_map(
            fn (string $value) => OrderStatus::from($value),
            self::TRANSITIONS[$from->value] ?? []
        );
    }
}
