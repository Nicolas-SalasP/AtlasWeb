<?php

namespace App\Domain\Product\Enums;

enum StockMovementType: string
{
    case Sale = 'sale';
    case Restore = 'restore';
    case Adjustment = 'adjustment';
    case Initial = 'initial';

    public function label(): string
    {
        return match ($this) {
            self::Sale       => 'Venta',
            self::Restore    => 'Restauración',
            self::Adjustment => 'Ajuste manual',
            self::Initial   => 'Stock inicial',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
