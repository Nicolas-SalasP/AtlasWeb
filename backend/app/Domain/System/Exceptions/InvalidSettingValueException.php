<?php

namespace App\Domain\System\Exceptions;

use DomainException;

class InvalidSettingValueException extends DomainException
{
    public function __construct(public readonly string $key, string $reason)
    {
        parent::__construct("Valor inválido para la configuración '{$key}': {$reason}");
    }
}
