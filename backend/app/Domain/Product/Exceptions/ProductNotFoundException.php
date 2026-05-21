<?php

namespace App\Domain\Product\Exceptions;

use DomainException;

class ProductNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $productId)
    {
        parent::__construct("Producto {$productId} no encontrado");
    }
}
