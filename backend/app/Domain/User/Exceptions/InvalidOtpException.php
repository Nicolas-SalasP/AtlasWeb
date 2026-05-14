<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class InvalidOtpException extends DomainException
{
    public function __construct()
    {
        parent::__construct('El código es inválido o ha expirado');
    }
}
