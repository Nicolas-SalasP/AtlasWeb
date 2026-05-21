<?php

namespace App\Domain\Payment\Exceptions;

use DomainException;
use Throwable;

class WebpayException extends DomainException
{
    public function __construct(string $message, ?Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
