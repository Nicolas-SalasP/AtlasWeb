<?php

namespace App\Domain\Product\Exceptions;

use DomainException;
use Throwable;

class ImageUploadException extends DomainException
{
    public function __construct(string $reason, ?Throwable $previous = null)
    {
        parent::__construct("Error al subir imagen: {$reason}", 0, $previous);
    }
}
