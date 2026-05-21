<?php

namespace App\Domain\Product\DTOs;

final readonly class CreateProductData
{
    public function __construct(
        public string $sku,
        public string $name,
        public int $price,
        public int $stockCurrent,
        public int $categoryId,
        public ?int $costPrice = null,
        public int $stockAlert = 5,
        public ?string $description = null,
        public ?array $specs = null,
        public bool $isVisible = true,
        public array $imageFiles = [],
    ) {
    }

    public static function fromValidated(array $data, array $imageFiles = []): self
    {
        return new self(
            sku: trim((string) $data['sku']),
            name: trim((string) $data['name']),
            price: (int) $data['price'],
            stockCurrent: (int) ($data['stock_current'] ?? 0),
            categoryId: (int) $data['category_id'],
            costPrice: isset($data['cost_price']) ? (int) $data['cost_price'] : null,
            stockAlert: isset($data['stock_alert']) ? (int) $data['stock_alert'] : 5,
            description: $data['description'] ?? null,
            specs: $data['specs'] ?? null,
            isVisible: array_key_exists('is_visible', $data)
                ? filter_var($data['is_visible'], FILTER_VALIDATE_BOOLEAN)
                : true,
            imageFiles: $imageFiles,
        );
    }
}
