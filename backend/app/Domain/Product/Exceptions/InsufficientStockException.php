<?php

namespace App\Domain\Product\Exceptions;

use DomainException;

class InsufficientStockException extends DomainException
{
    public function __construct(
        public readonly string $productName,
        public readonly int $available,
        public readonly int $requested,
    ) {
        parent::__construct("Stock insuficiente para {$productName}. Disponibles: {$available}, solicitados: {$requested}");
    }
}
