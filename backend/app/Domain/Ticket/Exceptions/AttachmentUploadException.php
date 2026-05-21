<?php

namespace App\Domain\Ticket\Exceptions;

use DomainException;
use Throwable;

class AttachmentUploadException extends DomainException
{
    public function __construct(string $reason, ?Throwable $previous = null)
    {
        parent::__construct("Error al subir adjunto: {$reason}", 0, $previous);
    }
}
