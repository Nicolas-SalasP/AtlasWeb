<?php

namespace App\Domain\Payment\Exceptions;

use App\Domain\Order\Enums\OrderStatus;
use DomainException;

class OrderNotPayableException extends DomainException
{
    public function __construct(public readonly OrderStatus $currentStatus)
    {
        parent::__construct("La orden no puede ser pagada porque su estado actual es '{$currentStatus->label()}'.");
    }
}
