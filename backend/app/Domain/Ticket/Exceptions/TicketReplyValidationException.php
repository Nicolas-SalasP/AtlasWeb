<?php

namespace App\Domain\Ticket\Exceptions;

use DomainException;

class TicketReplyValidationException extends DomainException
{
    public function __construct(string $reason)
    {
        parent::__construct($reason);
    }
}
