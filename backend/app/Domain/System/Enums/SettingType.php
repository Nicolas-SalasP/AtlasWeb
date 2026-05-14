<?php

namespace App\Domain\System\Enums;

enum SettingType: string
{
    case String = 'string';
    case Integer = 'integer';
    case Boolean = 'boolean';
    case Json = 'json';

    public function cast(?string $raw): mixed
    {
        if ($raw === null) {
            return null;
        }

        return match ($this) {
            self::Integer => (int) $raw,
            self::Boolean => $raw === '1' || strtolower($raw) === 'true',
            self::Json    => json_decode($raw, true) ?? null,
            self::String  => $raw,
        };
    }

    public function serialize(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($this) {
            self::Integer => (string) (int) $value,
            self::Boolean => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            self::Json    => json_encode($value),
            self::String  => (string) $value,
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
