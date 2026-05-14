<?php

namespace App\Domain\Order\Enums;

enum ShippingProvider: string
{
    case Propio = 'propio';
    case BlueExpress = 'bluexpress';
    case Starken = 'starken';
    case ChileExpress = 'chilexpress';
    case Correos = 'correos';

    public function label(): string
    {
        return match ($this) {
            self::Propio       => 'Reparto Propio',
            self::BlueExpress  => 'BlueExpress',
            self::Starken      => 'Starken',
            self::ChileExpress => 'Chilexpress',
            self::Correos      => 'Correos de Chile',
        };
    }

    public function trackingUrl(string $code): ?string
    {
        return match ($this) {
            self::BlueExpress  => "https://www.blue.cl/seguimiento/?codigo={$code}",
            self::Starken      => "https://www.starken.cl/seguimiento?codigo={$code}",
            self::ChileExpress => "https://www.chilexpress.cl/Views/ChilexpressCL/Resultado-busqueda.aspx?DATA={$code}",
            self::Correos      => "https://www.correos.cl/web/guest/seguimiento-en-linea?objEnvio={$code}",
            self::Propio       => null,
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
