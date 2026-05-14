<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class UserNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $userId)
    {
        parent::__construct("Usuario {$userId} no encontrado");
    }
}
