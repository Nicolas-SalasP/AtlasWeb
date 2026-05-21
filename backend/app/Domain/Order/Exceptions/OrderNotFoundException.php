<?php

namespace App\Domain\Order\Exceptions;

use DomainException;

class OrderNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $orderId)
    {
        parent::__construct("Orden {$orderId} no encontrada");
    }
}
