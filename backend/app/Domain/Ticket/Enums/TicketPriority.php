<?php

namespace App\Domain\Ticket\Enums;

enum TicketPriority: string
{
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';

    public function label(): string
    {
        return match ($this) {
            self::Baja    => 'Baja',
            self::Media   => 'Media',
            self::Alta    => 'Alta',
            self::Critica => 'Crítica',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
