<?php

namespace App\Domain\User\DTOs;

final readonly class AddressData
{
    public function __construct(
        public string $alias,
        public string $address,
        public string $number,
        public ?string $depto,
        public ?string $region,
        public ?string $commune,
        public bool $isDefault,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            alias: trim((string) $data['alias']),
            address: trim((string) $data['address']),
            number: trim((string) $data['number']),
            depto: isset($data['depto']) ? trim((string) $data['depto']) : null,
            region: isset($data['region']) ? trim((string) $data['region']) : null,
            commune: isset($data['commune']) ? trim((string) $data['commune']) : null,
            isDefault: filter_var($data['is_default'] ?? false, FILTER_VALIDATE_BOOLEAN),
        );
    }
}
