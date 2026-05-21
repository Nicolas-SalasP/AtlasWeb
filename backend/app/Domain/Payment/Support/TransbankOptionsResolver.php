<?php

namespace App\Domain\Payment\Support;

use App\Domain\System\Enums\SettingKey;
use App\Domain\System\Services\SettingService;
use Transbank\Webpay\Options;

final class TransbankOptionsResolver
{
    private const DEFAULT_INTEGRATION_CODE = '597055555532';
    private const DEFAULT_INTEGRATION_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

    public static function resolve(): Options
    {
        $settings = app(SettingService::class);

        $dbEnv = $settings->getRaw(SettingKey::WebpayEnv);
        $environment = $dbEnv === 'production'
            ? Options::ENVIRONMENT_PRODUCTION
            : Options::ENVIRONMENT_INTEGRATION;

        if ($environment === Options::ENVIRONMENT_INTEGRATION) {
            $commerceCode = config(
                'services.webpay.integration_code',
                env('WEBPAY_INTEGRATION_CODE', self::DEFAULT_INTEGRATION_CODE)
            );
            $apiKey = config(
                'services.webpay.integration_key',
                env('WEBPAY_INTEGRATION_KEY', self::DEFAULT_INTEGRATION_KEY)
            );
        } else {
            $commerceCode = $settings->getRaw(SettingKey::WebpayCode);
            $apiKey = $settings->getRaw(SettingKey::WebpayApiKey);
        }

        return new Options($commerceCode, $apiKey, $environment);
    }

    public static function isEnabled(): bool
    {
        $settings = app(SettingService::class);
        $value = $settings->getRaw(SettingKey::WebpayEnabled);

        return $value === null || $value === '1';
    }
}
