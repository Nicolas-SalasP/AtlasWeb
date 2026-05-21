<?php

namespace App\Domain\Payment\Exceptions;

use DomainException;

class BankReceiptAlreadyMatchedException extends DomainException
{
    public function __construct()
    {
        parent::__construct('Rechazado: Este comprobante ya ha sido vinculado a una orden anteriormente.');
    }
}
