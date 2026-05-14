<?php

namespace App\Domain\Catalog\DTOs;

use Illuminate\Http\UploadedFile;

final readonly class CreateServiceData
{
    public function __construct(
        public string $name,
        public int $price,
        public int $durationDays,
        public ?string $description,
        public ?array $features,
        public bool $isActive,
        public ?UploadedFile $image,
    ) {
    }

    public static function fromValidated(array $data, ?UploadedFile $image = null): self
    {
        return new self(
            name: trim((string) $data['name']),
            price: (int) $data['price'],
            durationDays: (int) $data['duration_days'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            features: is_array($data['features'] ?? null) ? $data['features'] : null,
            isActive: array_key_exists('is_active', $data)
                ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN)
                : true,
            image: $image,
        );
    }
}
