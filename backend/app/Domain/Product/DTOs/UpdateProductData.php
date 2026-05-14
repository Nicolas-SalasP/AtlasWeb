<?php

namespace App\Domain\Product\DTOs;

final readonly class UpdateProductData
{
    public function __construct(
        public ?string $sku,
        public ?string $name,
        public ?int $price,
        public ?int $stockCurrent,
        public ?int $stockAlert,
        public ?int $categoryId,
        public ?bool $isVisible,
        public bool $costPriceProvided,
        public ?int $costPrice,
        public bool $descriptionProvided,
        public ?string $description,
        public bool $specsProvided,
        public ?array $specs,
        public array $imageFiles,
    ) {
    }

    public static function fromValidated(array $data, array $imageFiles = []): self
    {
        return new self(
            sku: isset($data['sku']) ? trim((string) $data['sku']) : null,
            name: isset($data['name']) ? trim((string) $data['name']) : null,
            price: isset($data['price']) ? (int) $data['price'] : null,
            stockCurrent: isset($data['stock_current']) ? (int) $data['stock_current'] : null,
            stockAlert: isset($data['stock_alert']) ? (int) $data['stock_alert'] : null,
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            isVisible: array_key_exists('is_visible', $data)
                ? filter_var($data['is_visible'], FILTER_VALIDATE_BOOLEAN)
                : null,
            costPriceProvided: array_key_exists('cost_price', $data),
            costPrice: isset($data['cost_price']) ? (int) $data['cost_price'] : null,
            descriptionProvided: array_key_exists('description', $data),
            description: $data['description'] ?? null,
            specsProvided: array_key_exists('specs', $data),
            specs: $data['specs'] ?? null,
            imageFiles: $imageFiles,
        );
    }
}
