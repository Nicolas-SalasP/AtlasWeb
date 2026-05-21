<?php

namespace App\Domain\Ticket\Enums;

enum TicketCategory: string
{
    case ERP = 'ERP';
    case Web = 'Web';
    case Facturacion = 'Facturacion';
    case Soporte = 'Soporte';

    public function label(): string
    {
        return match ($this) {
            self::ERP         => 'ERP',
            self::Web         => 'Sitio Web',
            self::Facturacion => 'Facturación',
            self::Soporte     => 'Soporte General',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
