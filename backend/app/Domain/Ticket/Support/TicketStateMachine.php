<?php

namespace App\Domain\Ticket\Support;

use App\Domain\Ticket\Enums\TicketStatus;

final class TicketStateMachine
{
    private const TRANSITIONS = [
        'nuevo'             => ['abierto', 'cerrado'],
        'abierto'           => ['esperando_cliente', 'resuelto', 'cerrado'],
        'esperando_cliente' => ['abierto', 'resuelto', 'cerrado'],
        'resuelto'          => ['abierto', 'cerrado'],
        'cerrado'           => ['abierto'],
    ];

    public static function canTransition(TicketStatus $from, TicketStatus $to): bool
    {
        return in_array($to->value, self::TRANSITIONS[$from->value] ?? [], true);
    }

    public static function allowedTransitions(TicketStatus $from): array
    {
        return array_map(
            fn (string $value) => TicketStatus::from($value),
            self::TRANSITIONS[$from->value] ?? []
        );
    }
}
