<?php

namespace App\Domain\Ticket\Exceptions;

use DomainException;

class TicketNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $ticketId)
    {
        parent::__construct("Ticket {$ticketId} no encontrado");
    }
}
