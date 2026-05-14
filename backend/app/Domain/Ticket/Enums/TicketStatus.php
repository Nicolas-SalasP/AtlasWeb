<?php

namespace App\Domain\Ticket\Enums;

enum TicketStatus: string
{
    case Nuevo = 'nuevo';
    case Abierto = 'abierto';
    case EsperandoCliente = 'esperando_cliente';
    case Resuelto = 'resuelto';
    case Cerrado = 'cerrado';

    public function label(): string
    {
        return match ($this) {
            self::Nuevo            => 'Nuevo',
            self::Abierto          => 'Abierto',
            self::EsperandoCliente => 'Esperando cliente',
            self::Resuelto         => 'Resuelto',
            self::Cerrado          => 'Cerrado',
        };
    }

    public function isTerminal(): bool
    {
        return $this === self::Cerrado;
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
