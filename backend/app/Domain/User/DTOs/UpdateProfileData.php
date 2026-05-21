<?php

namespace App\Domain\User\DTOs;

final readonly class UpdateProfileData
{
    public function __construct(
        public string $name,
        public bool $phoneProvided,
        public ?string $phone,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            name: trim((string) $data['name']),
            phoneProvided: array_key_exists('phone', $data),
            phone: isset($data['phone']) ? trim((string) $data['phone']) : null,
        );
    }
}
