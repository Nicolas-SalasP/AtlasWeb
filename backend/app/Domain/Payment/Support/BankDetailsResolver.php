<?php

namespace App\Domain\Payment\Support;

use App\Models\SystemSetting;

final class BankDetailsResolver
{
    private const DEFAULTS = [
        'bank_name'           => 'Banco Estado',
        'bank_account_type'   => 'Cuenta Vista',
        'bank_account_number' => '123456789',
        'bank_rut'            => '11.111.111-1',
        'bank_email'          => 'pagos@tuempresa.cl',
    ];

    public static function resolve(): array
    {
        $details = [];

        foreach (self::DEFAULTS as $key => $default) {
            $value = SystemSetting::where('key', $key)->value('value');
            $details[$key] = $value !== null && $value !== '' ? $value : $default;
        }

        return $details;
    }
}
