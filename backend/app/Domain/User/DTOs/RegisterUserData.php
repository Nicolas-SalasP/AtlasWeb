<?php

namespace App\Domain\User\DTOs;

final readonly class RegisterUserData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $rut,
        public string $password,
        public string $clientIp,
    ) {
    }

    public static function fromValidated(array $data, string $clientIp): self
    {
        return new self(
            name: trim((string) $data['name']),
            email: strtolower(trim((string) $data['email'])),
            rut: trim((string) $data['rut']),
            password: (string) $data['password'],
            clientIp: $clientIp,
        );
    }
}
