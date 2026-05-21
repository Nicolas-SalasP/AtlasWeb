<?php

namespace App\Domain\Payment\Exceptions;

use App\Domain\Payment\Enums\PaymentMethod;
use DomainException;

class PaymentMethodDisabledException extends DomainException
{
    public function __construct(public readonly PaymentMethod $method)
    {
        parent::__construct("El método de pago '{$method->label()}' no se encuentra habilitado.");
    }
}
