<?php

namespace App\Domain\Erp\Exceptions;

use Exception;

class ErpProvisioningException extends Exception
{
    public function __construct(string $message, public readonly ?int $httpStatus = null, public readonly ?string $erpResponse = null)
    {
        parent::__construct($message);
    }
}
