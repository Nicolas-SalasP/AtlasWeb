<?php

namespace App\Domain\Billing\Exceptions;

use DomainException;

class InvalidRutException extends DomainException
{
    public function __construct(public readonly string $rut)
    {
        parent::__construct("El RUT '{$rut}' no tiene un formato válido");
    }
}
