<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class EmailAlreadyTakenException extends DomainException
{
    public function __construct(public readonly string $email)
    {
        parent::__construct("El correo {$email} ya está en uso");
    }
}
