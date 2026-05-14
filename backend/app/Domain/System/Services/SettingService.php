<?php

namespace App\Domain\System\Services;

use App\Domain\System\Enums\SettingKey;
use App\Domain\System\Enums\SettingType;
use App\Domain\System\Exceptions\InvalidSettingValueException;
use App\Domain\System\Models\Setting;
use App\Domain\System\Support\EditableSettings;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SettingService
{
    public const MAINTENANCE_CACHE_KEY = 'system_maintenance_status';

    public function allRaw(): array
    {
        return Setting::all()->pluck('value', 'key')->all();
    }

    public function getRaw(SettingKey $key): ?string
    {
        $value = Setting::where('key', $key->value)->value('value');

        return $value !== null ? (string) $value : null;
    }

    public function getTyped(SettingKey $key): mixed
    {
        $raw = $this->getRaw($key);

        return $key->type()->cast($raw);
    }

    public function isTrue(SettingKey $key): bool
    {
        return (bool) $this->getTyped($key);
    }

    public function updateMany(array $data): void
    {
        $filtered = [];
        foreach ($data as $key => $value) {
            if (!EditableSettings::isEditable((string) $key)) {
                continue;
            }
            if ($value === null) {
                continue;
            }
            $filtered[$key] = $value;
        }

        if (empty($filtered)) {
            return;
        }

        DB::transaction(function () use ($filtered) {
            foreach ($filtered as $key => $value) {
                $enumKey = SettingKey::tryFrom((string) $key);
                $type = $enumKey?->type() ?? SettingType::String;

                $serialized = $type->serialize($value);

                if ($serialized === null) {
                    throw new InvalidSettingValueException((string) $key, 'No se pudo serializar el valor enviado.');
                }

                Setting::updateOrCreate(
                    ['key' => (string) $key],
                    [
                        'value' => $serialized,
                        'type'  => $type->value,
                    ]
                );
            }
        });

        Cache::forget(self::MAINTENANCE_CACHE_KEY);
    }

    public function maintenanceModeCached(int $ttlSeconds = 60): bool
    {
        $value = Cache::remember(self::MAINTENANCE_CACHE_KEY, $ttlSeconds, function () {
            return $this->getRaw(SettingKey::MaintenanceMode);
        });

        return SettingType::Boolean->cast($value) === true;
    }
}
