<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class IncorrectPasswordException extends DomainException
{
    public function __construct()
    {
        parent::__construct('La contraseña actual es incorrecta');
    }
}
