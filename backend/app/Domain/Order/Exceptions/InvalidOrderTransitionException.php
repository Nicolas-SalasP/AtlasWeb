<?php

namespace App\Domain\Order\Exceptions;

use App\Domain\Order\Enums\OrderStatus;
use DomainException;

class InvalidOrderTransitionException extends DomainException
{
    public function __construct(
        public readonly OrderStatus $from,
        public readonly OrderStatus $to,
    ) {
        parent::__construct("Transición no permitida: {$from->value} → {$to->value}");
    }
}
