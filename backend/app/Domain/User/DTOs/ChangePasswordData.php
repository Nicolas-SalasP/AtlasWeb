<?php

namespace App\Domain\User\DTOs;

final readonly class ChangePasswordData
{
    public function __construct(
        public string $currentPassword,
        public string $newPassword,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            currentPassword: (string) $data['current_password'],
            newPassword: (string) $data['new_password'],
        );
    }
}
