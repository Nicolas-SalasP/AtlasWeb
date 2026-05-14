<?php

namespace App\Domain\Payment\Support;

use App\Models\SystemSetting;
use Transbank\Webpay\Options;

final class TransbankOptionsResolver
{
    private const DEFAULT_INTEGRATION_CODE = '597055555532';
    private const DEFAULT_INTEGRATION_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

    public static function resolve(): Options
    {
        $dbEnv = SystemSetting::where('key', 'webpay_env')->value('value');
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
            $commerceCode = SystemSetting::where('key', 'webpay_code')->value('value');
            $apiKey = SystemSetting::where('key', 'webpay_api_key')->value('value');
        }

        return new Options($commerceCode, $apiKey, $environment);
    }

    public static function isEnabled(): bool
    {
        $value = SystemSetting::where('key', 'webpay_enabled')->value('value');

        return $value === null || $value === '1';
    }
}
