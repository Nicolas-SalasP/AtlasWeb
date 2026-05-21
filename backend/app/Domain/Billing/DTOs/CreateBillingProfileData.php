<?php

namespace App\Domain\Billing\DTOs;

final readonly class CreateBillingProfileData
{
    public function __construct(
        public string $rut,
        public string $businessName,
        public string $businessLine,
        public string $address,
        public ?string $city,
        public ?string $emailDte,
        public bool $isDefault,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            rut: trim((string) $data['rut']),
            businessName: trim((string) $data['business_name']),
            businessLine: trim((string) $data['business_line']),
            address: trim((string) $data['address']),
            city: isset($data['city']) ? trim((string) $data['city']) : null,
            emailDte: isset($data['email_dte']) ? strtolower(trim((string) $data['email_dte'])) : null,
            isDefault: filter_var($data['is_default'] ?? false, FILTER_VALIDATE_BOOLEAN),
        );
    }
}
