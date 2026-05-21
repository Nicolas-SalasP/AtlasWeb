<?php

namespace App\Domain\User\Exceptions;

use DomainException;

class AddressNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $addressId)
    {
        parent::__construct("Dirección {$addressId} no encontrada");
    }
}
