<?php

namespace App\Domain\Catalog\Exceptions;

use DomainException;

class OfferingNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $offeringId)
    {
        parent::__construct("Servicio del catálogo {$offeringId} no encontrado");
    }
}
