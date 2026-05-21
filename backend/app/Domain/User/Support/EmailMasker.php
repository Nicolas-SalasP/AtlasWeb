<?php

namespace App\Domain\User\Support;

final class EmailMasker
{
    public static function mask(string $email): ?string
    {
        $parts = explode('@', $email);

        if (count($parts) !== 2) {
            return null;
        }

        [$name, $domain] = $parts;

        if ($name === '') {
            return null;
        }

        $length = strlen($name);
        $masked = substr($name, 0, 1)
            . str_repeat('*', max($length - 2, 1))
            . substr($name, -1);

        return $masked . '@' . $domain;
    }
}
