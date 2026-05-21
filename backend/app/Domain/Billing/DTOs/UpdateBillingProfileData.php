<?php

namespace App\Domain\Billing\DTOs;

final readonly class UpdateBillingProfileData
{
    public function __construct(
        public ?string $rut,
        public ?string $businessName,
        public ?string $businessLine,
        public ?string $address,
        public bool $cityProvided,
        public ?string $city,
        public bool $emailDteProvided,
        public ?string $emailDte,
        public ?bool $isDefault,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            rut: isset($data['rut']) ? trim((string) $data['rut']) : null,
            businessName: isset($data['business_name']) ? trim((string) $data['business_name']) : null,
            businessLine: isset($data['business_line']) ? trim((string) $data['business_line']) : null,
            address: isset($data['address']) ? trim((string) $data['address']) : null,
            cityProvided: array_key_exists('city', $data),
            city: isset($data['city']) ? trim((string) $data['city']) : null,
            emailDteProvided: array_key_exists('email_dte', $data),
            emailDte: isset($data['email_dte']) ? strtolower(trim((string) $data['email_dte'])) : null,
            isDefault: array_key_exists('is_default', $data)
                ? filter_var($data['is_default'], FILTER_VALIDATE_BOOLEAN)
                : null,
        );
    }
}
