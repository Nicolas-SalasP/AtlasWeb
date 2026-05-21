<?php

namespace App\Domain\User\Enums;

enum UserRole: int
{
    case Admin = 1;
    case Cliente = 2;

    public function label(): string
    {
        return match ($this) {
            self::Admin   => 'Administrador',
            self::Cliente => 'Cliente',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
