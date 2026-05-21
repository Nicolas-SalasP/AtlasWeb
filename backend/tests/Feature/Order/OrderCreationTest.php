<?php

namespace Tests\Feature\Order;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_order_with_pending_status_by_default(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 2]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', [
            'status' => OrderStatus::Pending->value,
        ]);
    }

    public function test_returns_order_id_in_response(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]));

        $response->assertStatus(201);
        $response->assertJsonPath('order.id', fn ($id) => is_int($id) && $id > 0);
    }

    public function test_calculates_subtotal_correctly_from_product_price(): void
    {
        $product = $this->makeProduct(['price' => 15000]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 3],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame(45000, (int) $order->subtotal);
    }

    public function test_uses_shipping_rate_for_metropolitana(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['customer_data' => $this->makeCustomerData(['region' => 'Metropolitana'])],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame(3990, (int) $order->shipping_cost);
    }

    public function test_uses_higher_shipping_rate_for_magallanes(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['customer_data' => $this->makeCustomerData(['region' => 'Magallanes'])],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame(12990, (int) $order->shipping_cost);
    }

    public function test_total_equals_subtotal_plus_shipping(): void
    {
        $product = $this->makeProduct(['price' => 20000]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame((int) $order->subtotal + (int) $order->shipping_cost, (int) $order->total);
    }

    public function test_creates_order_items_for_each_cart_product(): void
    {
        $product1 = $this->makeProduct();
        $product2 = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product1->id, 'quantity' => 2],
            ['id' => $product2->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertCount(2, $order->items);
    }

    public function test_order_number_is_generated_and_unique(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $orders = Order::all();
        $this->assertCount(2, $orders);
        $this->assertNotEquals($orders[0]->order_number, $orders[1]->order_number);
        $this->assertNotNull($orders[0]->order_number);
    }

    public function test_decreases_product_stock_after_creation(): void
    {
        $product = $this->makeProduct(['stock_current' => 10]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 3],
        ]))->assertStatus(201);

        $this->assertSame(7, (int) $product->fresh()->stock_current);
    }

    public function test_stores_customer_data_as_json(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $customer = $this->makeCustomerData(['nombre' => 'Nombre Específico']);

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['customer_data' => $customer],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame('Nombre Específico', $order->customer_data['nombre']);
    }

    public function test_persists_shipping_address(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['shipping_address' => 'Av. Test 456, Comuna, Region'],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertStringContainsString('Av. Test 456', $order->shipping_address);
    }

    public function test_persists_optional_notes(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['notes' => 'Dejar en portería con Don José'],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertStringContainsString('Don José', $order->notes);
    }

    public function test_associates_order_with_authenticated_user(): void
    {
        $product = $this->makeProduct();
        $user = $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame($user->id, $order->user_id);
    }

    public function test_creates_order_with_multiple_quantities(): void
    {
        $product = $this->makeProduct(['price' => 5000, 'stock_current' => 100]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 10],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertSame(50000, (int) $order->subtotal);

        $item = $order->items->first();
        $this->assertSame(10, $item->quantity);
        $this->assertSame(50000, (int) $item->total_line);
    }

    public function test_order_item_stores_product_snapshot_data(): void
    {
        $product = $this->makeProduct(['name' => 'Producto X', 'sku' => 'SKU-TEST-001']);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $item = OrderItem::latest('id')->first();
        $this->assertSame('Producto X', $item->product_name);
        $this->assertSame('SKU-TEST-001', $item->sku_snapshot);
    }
}
