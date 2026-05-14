<?php

namespace App\Domain\Payment\Exceptions;

use DomainException;

class DuplicateBankReceiptException extends DomainException
{
    public function __construct(public readonly string $transactionNumber)
    {
        parent::__construct("Ya existe un comprobante con el número de transacción {$transactionNumber}");
    }
}
