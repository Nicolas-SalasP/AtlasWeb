<?php

namespace App\Domain\Payment\Enums;

enum PaymentMethod: string
{
    case Transfer = 'transfer';
    case Webpay = 'webpay';

    public function label(): string
    {
        return match ($this) {
            self::Transfer => 'Transferencia Bancaria',
            self::Webpay   => 'Webpay',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
