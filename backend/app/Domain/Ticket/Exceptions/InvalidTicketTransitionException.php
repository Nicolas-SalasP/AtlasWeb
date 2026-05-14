<?php

namespace App\Domain\Ticket\Exceptions;

use App\Domain\Ticket\Enums\TicketStatus;
use DomainException;

class InvalidTicketTransitionException extends DomainException
{
    public function __construct(
        public readonly TicketStatus $from,
        public readonly TicketStatus $to,
    ) {
        parent::__construct("Transición de ticket no permitida: {$from->value} → {$to->value}");
    }
}
