<?php

namespace App\Domain\Payment\Support;

use App\Domain\System\Enums\SettingKey;
use App\Domain\System\Services\SettingService;

final class BankDetailsResolver
{
    private const DEFAULTS = [
        'bank_name'           => 'Banco Estado',
        'bank_account_type'   => 'Cuenta Vista',
        'bank_account_number' => '123456789',
        'bank_rut'            => '11.111.111-1',
        'bank_email'          => 'pagos@tuempresa.cl',
    ];

    private const KEY_MAP = [
        'bank_name'           => SettingKey::BankName,
        'bank_account_type'   => SettingKey::BankAccountType,
        'bank_account_number' => SettingKey::BankAccountNumber,
        'bank_rut'            => SettingKey::BankRut,
        'bank_email'          => SettingKey::BankEmail,
    ];

    public static function resolve(): array
    {
        $settings = app(SettingService::class);
        $details = [];

        foreach (self::DEFAULTS as $key => $default) {
            $value = $settings->getRaw(self::KEY_MAP[$key]);
            $details[$key] = $value !== null && $value !== '' ? $value : $default;
        }

        return $details;
    }
}
