<?php

namespace App\Domain\Payment\Support;

final class AllowedBankEmails
{
    private const ADDRESSES = [
        'enviodigital@bancochile.cl',
        'serviciodetransferencias@bancochile.cl',
        'noreply@correo.bancoestado.cl',
        'notificaciones@cl.bancofalabella.com',
        'mensajeria@santander.cl',
        'transferencias@bci.cl',
        'itaupersonas@itau.cl',
    ];

    public static function isAllowed(string $email): bool
    {
        return in_array(strtolower(trim($email)), self::ADDRESSES, true);
    }

    public static function all(): array
    {
        return self::ADDRESSES;
    }
}
