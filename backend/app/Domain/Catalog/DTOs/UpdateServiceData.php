<?php

namespace App\Domain\Catalog\DTOs;

use Illuminate\Http\UploadedFile;

final readonly class UpdateServiceData
{
    public function __construct(
        public ?string $name,
        public ?int $price,
        public ?int $durationDays,
        public bool $descriptionProvided,
        public ?string $description,
        public bool $featuresProvided,
        public ?array $features,
        public ?bool $isActive,
        public ?UploadedFile $image,
    ) {
    }

    public static function fromValidated(array $data, ?UploadedFile $image = null): self
    {
        return new self(
            name: isset($data['name']) ? trim((string) $data['name']) : null,
            price: isset($data['price']) ? (int) $data['price'] : null,
            durationDays: isset($data['duration_days']) ? (int) $data['duration_days'] : null,
            descriptionProvided: array_key_exists('description', $data),
            description: $data['description'] ?? null,
            featuresProvided: array_key_exists('features', $data),
            features: is_array($data['features'] ?? null) ? $data['features'] : null,
            isActive: array_key_exists('is_active', $data)
                ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN)
                : null,
            image: $image,
        );
    }
}
