<?php

namespace App\Domain\Product\Exceptions;

use DomainException;

class CategoryNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $categoryId)
    {
        parent::__construct("Categoría {$categoryId} no encontrada");
    }
}
