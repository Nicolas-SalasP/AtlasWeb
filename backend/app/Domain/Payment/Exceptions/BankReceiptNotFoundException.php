<?php

namespace App\Domain\Payment\Exceptions;

use DomainException;

class BankReceiptNotFoundException extends DomainException
{
    public function __construct(public readonly int|string $receiptId)
    {
        parent::__construct("Comprobante bancario {$receiptId} no encontrado");
    }
}
