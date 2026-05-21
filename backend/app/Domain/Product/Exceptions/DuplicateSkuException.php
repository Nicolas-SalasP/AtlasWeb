<?php

namespace App\Domain\Product\Exceptions;

use DomainException;

class DuplicateSkuException extends DomainException
{
    public function __construct(public readonly string $sku)
    {
        parent::__construct("El SKU '{$sku}' ya está en uso por otro producto");
    }
}
