<?php

namespace App\Domain\Order\DTOs;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Enums\ShippingProvider;

final readonly class UpdateOrderData
{
    public function __construct(
        public ?OrderStatus $status,
        public bool $statusProvided,
        public ?string $notes,
        public bool $notesProvided,
        public ?ShippingProvider $shippingProvider,
        public bool $shippingProviderProvided,
        public ?string $trackingNumber,
        public bool $trackingNumberProvided,
        public ?int $actorUserId,
        public ?string $actorName,
    ) {
    }

    public static function fromValidated(array $data, ?int $actorUserId, ?string $actorName): self
    {
        return new self(
            status: isset($data['status']) ? OrderStatus::from($data['status']) : null,
            statusProvided: array_key_exists('status', $data),
            notes: $data['notes'] ?? null,
            notesProvided: array_key_exists('notes', $data),
            shippingProvider: isset($data['shipping_provider']) ? ShippingProvider::from($data['shipping_provider']) : null,
            shippingProviderProvided: array_key_exists('shipping_provider', $data),
            trackingNumber: $data['tracking_number'] ?? null,
            trackingNumberProvided: array_key_exists('tracking_number', $data),
            actorUserId: $actorUserId,
            actorName: $actorName,
        );
    }
}
