<?php

namespace App\Domain\Order\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Preparing = 'preparing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending   => 'Pendiente de pago',
            self::Paid      => 'Pagado',
            self::Preparing => 'En preparación',
            self::Shipped   => 'Enviado',
            self::Delivered => 'Entregado',
            self::Cancelled => 'Anulado',
            self::Refunded  => 'Reembolsado',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Cancelled, self::Refunded], true);
    }

    public function reversesStock(): bool
    {
        return in_array($this, [self::Cancelled, self::Refunded], true);
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
