<?php

namespace App\Domain\Billing\Support;

final class RutValidator
{
    public static function normalize(string $rut): string
    {
        $clean = strtoupper(preg_replace('/[^0-9kK]/', '', $rut) ?? '');

        if ($clean === '') {
            return '';
        }

        $body = substr($clean, 0, -1);
        $dv = substr($clean, -1);

        if ($body === '' || $dv === '') {
            return '';
        }

        return number_format((int) $body, 0, ',', '.') . '-' . $dv;
    }

    public static function isValid(string $rut): bool
    {
        $clean = strtoupper(preg_replace('/[^0-9kK]/', '', $rut) ?? '');

        if (strlen($clean) < 2) {
            return false;
        }

        $body = substr($clean, 0, -1);
        $dv = substr($clean, -1);

        if (!ctype_digit($body)) {
            return false;
        }

        if (!ctype_digit($dv) && $dv !== 'K') {
            return false;
        }

        return self::computeDv((int) $body) === $dv;
    }

    private static function computeDv(int $number): string
    {
        $factors = [2, 3, 4, 5, 6, 7];
        $sum = 0;
        $index = 0;
        $digits = strrev((string) $number);

        for ($i = 0, $len = strlen($digits); $i < $len; $i++) {
            $sum += ((int) $digits[$i]) * $factors[$index];
            $index = ($index + 1) % count($factors);
        }

        $remainder = 11 - ($sum % 11);

        return match (true) {
            $remainder === 11 => '0',
            $remainder === 10 => 'K',
            default           => (string) $remainder,
        };
    }
}
