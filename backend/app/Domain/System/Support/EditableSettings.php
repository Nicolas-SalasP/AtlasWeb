<?php

namespace App\Domain\System\Support;

use App\Domain\System\Enums\SettingKey;

final class EditableSettings
{
    private const EDITABLE = [
        SettingKey::MaintenanceMode,
        SettingKey::WebpayEnabled,
        SettingKey::WebpayEnv,
        SettingKey::WebpayCode,
        SettingKey::WebpayApiKey,
        SettingKey::BankName,
        SettingKey::BankAccountType,
        SettingKey::BankAccountNumber,
        SettingKey::BankRut,
        SettingKey::BankEmail,
        SettingKey::StoreName,
        SettingKey::ContactEmail,
        SettingKey::ContactPhone,
        SettingKey::FreeShippingThreshold,
    ];

    public static function keys(): array
    {
        return array_map(fn (SettingKey $k) => $k->value, self::EDITABLE);
    }

    public static function isEditable(string $key): bool
    {
        return in_array($key, self::keys(), true);
    }

    public static function asEnumList(): array
    {
        return self::EDITABLE;
    }
}
