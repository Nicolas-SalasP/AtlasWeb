<?php

namespace App\Domain\User\DTOs;

final readonly class UpdateUserData
{
    public function __construct(
        public string $name,
        public string $email,
        public bool $isActive,
        public bool $roleIdProvided,
        public ?int $roleId,
        public bool $permissionsProvided,
        public ?array $permissions,
        public bool $phoneProvided,
        public ?string $phone,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            name: trim((string) $data['name']),
            email: strtolower(trim((string) $data['email'])),
            isActive: (bool) $data['is_active'],
            roleIdProvided: array_key_exists('role_id', $data),
            roleId: isset($data['role_id']) ? (int) $data['role_id'] : null,
            permissionsProvided: array_key_exists('permissions', $data),
            permissions: is_array($data['permissions'] ?? null) ? $data['permissions'] : null,
            phoneProvided: array_key_exists('phone', $data),
            phone: isset($data['phone']) ? trim((string) $data['phone']) : null,
        );
    }
}
