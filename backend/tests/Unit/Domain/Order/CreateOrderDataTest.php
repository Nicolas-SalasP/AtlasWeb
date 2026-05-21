<?php

namespace Tests\Unit\Domain\Order;

use App\Domain\Order\DTOs\CreateOrderData;
use PHPUnit\Framework\TestCase;

class CreateOrderDataTest extends TestCase
{
    public function test_constructor_assigns_all_properties(): void
    {
        $dto = new CreateOrderData(
            userId: 42,
            items: [['id' => 1, 'quantity' => 2]],
            customerData: ['nombre' => 'Test'],
            shippingAddress: 'Calle 123',
            notes: 'Sin timbre',
            clientIp: '127.0.0.1',
        );

        $this->assertSame(42, $dto->userId);
        $this->assertCount(1, $dto->items);
        $this->assertSame(['nombre' => 'Test'], $dto->customerData);
        $this->assertSame('Calle 123', $dto->shippingAddress);
        $this->assertSame('Sin timbre', $dto->notes);
        $this->assertSame('127.0.0.1', $dto->clientIp);
    }

    public function test_from_array_with_full_data(): void
    {
        $dto = CreateOrderData::fromArray([
            'items'            => [['id' => 1, 'quantity' => 3]],
            'customer_data'    => ['email' => 'a@b.cl'],
            'shipping_address' => 'Av X 1',
            'notes'            => 'Llamar antes',
        ], userId: 7, clientIp: '8.8.8.8');

        $this->assertSame(7, $dto->userId);
        $this->assertSame([['id' => 1, 'quantity' => 3]], $dto->items);
        $this->assertSame(['email' => 'a@b.cl'], $dto->customerData);
        $this->assertSame('Av X 1', $dto->shippingAddress);
        $this->assertSame('Llamar antes', $dto->notes);
        $this->assertSame('8.8.8.8', $dto->clientIp);
    }

    public function test_from_array_with_null_user_id_for_guest_checkout(): void
    {
        $dto = CreateOrderData::fromArray([
            'items'         => [['id' => 1, 'quantity' => 1]],
            'customer_data' => [],
        ], userId: null, clientIp: '127.0.0.1');

        $this->assertNull($dto->userId);
    }

    public function test_from_array_with_missing_fields_uses_defaults(): void
    {
        $dto = CreateOrderData::fromArray(
            data: [],
            userId: 1,
            clientIp: '127.0.0.1',
        );

        $this->assertSame([], $dto->items);
        $this->assertSame([], $dto->customerData);
        $this->assertNull($dto->shippingAddress);
        $this->assertNull($dto->notes);
    }

    public function test_dto_is_readonly_and_properties_cannot_be_modified(): void
    {
        $dto = CreateOrderData::fromArray(['items' => []], 1, '127.0.0.1');

        $this->expectException(\Error::class);
        $this->expectExceptionMessage('Cannot modify readonly property');

        $dto->userId = 999;
    }

    public function test_items_array_preserves_order(): void
    {
        $items = [
            ['id' => 5, 'quantity' => 1],
            ['id' => 1, 'quantity' => 2],
            ['id' => 3, 'quantity' => 3],
        ];

        $dto = CreateOrderData::fromArray(['items' => $items], 1, '127.0.0.1');

        $this->assertSame($items, $dto->items);
    }

    public function test_service_items_are_accepted_in_items_array(): void
    {
        $items = [
            ['id' => 'service-3', 'quantity' => 1],
            ['id' => 5, 'quantity' => 2],
        ];

        $dto = CreateOrderData::fromArray(['items' => $items], 1, '127.0.0.1');

        $this->assertCount(2, $dto->items);
        $this->assertSame('service-3', $dto->items[0]['id']);
    }
}
