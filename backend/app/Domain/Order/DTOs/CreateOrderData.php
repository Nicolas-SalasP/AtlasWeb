<?php

namespace App\Domain\Order\DTOs;

final readonly class CreateOrderData
{
    public function __construct(
        public ?int $userId,
        public array $items,
        public array $customerData,
        public ?string $shippingAddress,
        public ?string $notes,
        public string $clientIp,
    ) {
    }

    public static function fromArray(array $data, ?int $userId, string $clientIp): self
    {
        return new self(
            userId: $userId,
            items: $data['items'] ?? [],
            customerData: $data['customer_data'] ?? [],
            shippingAddress: $data['shipping_address'] ?? null,
            notes: $data['notes'] ?? null,
            clientIp: $clientIp,
        );
    }
}
