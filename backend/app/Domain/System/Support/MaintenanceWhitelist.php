<?php

namespace App\Domain\System\Support;

final class MaintenanceWhitelist
{
    private const ALLOWED_PATHS = [
        'api/admin',
        'api/login',
        'api/logout',
        'api/me',
        'api/user',
        'api/settings',
        'api/sanctum/csrf-cookie',
        'api/system-status',
    ];

    public static function isAllowed(string $path): bool
    {
        foreach (self::ALLOWED_PATHS as $allowed) {
            if (str_starts_with($path, $allowed)) {
                return true;
            }
        }

        return false;
    }
}
