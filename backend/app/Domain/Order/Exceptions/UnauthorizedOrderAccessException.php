<?php

namespace App\Domain\Order\Exceptions;

use DomainException;

class UnauthorizedOrderAccessException extends DomainException
{
    public function __construct()
    {
        parent::__construct('No tienes acceso a esta orden');
    }
}
