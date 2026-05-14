<?php

namespace App\Domain\Catalog\Exceptions;

use DomainException;
use Throwable;

class ServiceImageUploadException extends DomainException
{
    public function __construct(string $reason, ?Throwable $previous = null)
    {
        parent::__construct("Error al subir imagen del servicio: {$reason}", 0, $previous);
    }
}
