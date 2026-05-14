<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class ForbiddenUserOperationException extends DomainException
{
    public function __construct(string $message)
    {
        parent::__construct($message);
    }
}
