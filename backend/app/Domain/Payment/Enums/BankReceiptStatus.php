<?php

namespace App\Domain\Payment\Enums;

enum BankReceiptStatus: string
{
    case Unmatched = 'unmatched';
    case Matched = 'matched';

    public function label(): string
    {
        return match ($this) {
            self::Unmatched => 'Sin asociar',
            self::Matched   => 'Asociado a orden',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
