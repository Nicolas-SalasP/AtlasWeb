<?php

namespace App\Domain\System\Enums;

enum SettingKey: string
{
    case MaintenanceMode = 'maintenance_mode';
    case WebpayEnabled = 'webpay_enabled';
    case WebpayEnv = 'webpay_env';
    case WebpayCode = 'webpay_code';
    case WebpayApiKey = 'webpay_api_key';
    case BankName = 'bank_name';
    case BankAccountType = 'bank_account_type';
    case BankAccountNumber = 'bank_account_number';
    case BankRut = 'bank_rut';
    case BankEmail = 'bank_email';
    case StoreName = 'store_name';
    case ContactEmail = 'contact_email';
    case ContactPhone = 'contact_phone';
    case FreeShippingThreshold = 'free_shipping_threshold';

    public function type(): SettingType
    {
        return match ($this) {
            self::MaintenanceMode,
            self::WebpayEnabled         => SettingType::Boolean,
            self::FreeShippingThreshold => SettingType::Integer,
            default                     => SettingType::String,
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
