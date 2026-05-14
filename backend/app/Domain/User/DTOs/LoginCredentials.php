<?php

namespace App\Domain\User\DTOs;

final readonly class LoginCredentials
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            email: strtolower(trim((string) $data['email'])),
            password: (string) $data['password'],
            remember: (bool) ($data['remember_me'] ?? false),
        );
    }
}
