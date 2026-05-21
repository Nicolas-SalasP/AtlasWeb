<?php

namespace App\Domain\Order\Support;

final class ChileShippingRates
{
    private const RATES = [
        'Metropolitana'      => 3990,
        'Valparaíso'         => 5990,
        'Biobío'             => 6990,
        'Arica y Parinacota' => 10990,
        'Tarapacá'           => 10990,
        'Antofagasta'        => 8990,
        'Atacama'            => 7990,
        'Coquimbo'           => 6990,
        "O'Higgins"          => 5990,
        'Maule'              => 6990,
        'Ñuble'              => 6990,
        'La Araucanía'       => 7990,
        'Los Ríos'           => 8990,
        'Los Lagos'          => 9990,
        'Aysén'              => 12990,
        'Magallanes'         => 12990,
    ];

    private const DEFAULT_RATE = 7990;

    public static function for(string $region): int
    {
        return self::RATES[$region] ?? self::DEFAULT_RATE;
    }

    public static function supportedRegions(): array
    {
        return array_keys(self::RATES);
    }
}
