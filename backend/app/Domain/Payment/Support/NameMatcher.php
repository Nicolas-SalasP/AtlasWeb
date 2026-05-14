<?php

namespace App\Domain\Payment\Support;

final class NameMatcher
{
    public static function isFuzzyMatch(?string $bankName, ?string $customerName): bool
    {
        if ($bankName === null || $bankName === '' || $customerName === null || $customerName === '') {
            return false;
        }

        $bankWords = explode(' ', strtolower(trim($bankName)));
        $customerWords = explode(' ', strtolower(trim($customerName)));

        foreach ($customerWords as $cWord) {
            if (strlen($cWord) <= 2) {
                continue;
            }
            foreach ($bankWords as $bWord) {
                if (str_contains($bWord, $cWord) || str_contains($cWord, $bWord)) {
                    return true;
                }
            }
        }

        return false;
    }
}
