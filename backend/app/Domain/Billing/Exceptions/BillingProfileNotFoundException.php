<?php

namespace App\Domain\Billing\Exceptions;

use DomainException;

class BillingProfileNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $profileId)
    {
        parent::__construct("Perfil de facturación {$profileId} no encontrado");
    }
}
