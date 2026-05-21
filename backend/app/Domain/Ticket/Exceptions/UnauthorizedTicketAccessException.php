<?php

namespace App\Domain\Ticket\Exceptions;

use DomainException;

class UnauthorizedTicketAccessException extends DomainException
{
    public function __construct(string $message = 'Acceso denegado. Este ticket pertenece a otra cuenta.')
    {
        parent::__construct($message);
    }
}
