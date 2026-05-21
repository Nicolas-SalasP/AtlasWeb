<?php

namespace Tests\Feature\Order;

use App\Domain\Order\Models\Order;
use App\Domain\Product\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejects_order_with_insufficient_stock(): void
    {
        $product = $this->makeProduct(['stock_current' => 2]);
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 10],
        ]));

        $this->assertContains($response->getStatusCode(), [400, 422]);
        $this->assertSame(0, Order::count());
    }

    public function test_stock_unchanged_when_order_fails(): void
    {
        $product = $this->makeProduct(['stock_current' => 5]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 100],
        ]));

        $this->assertSame(5, (int) $product->fresh()->stock_current);
    }

    public function test_can_order_exact_stock_amount(): void
    {
        $product = $this->makeProduct(['stock_current' => 5]);
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 5],
        ]));

        $response->assertStatus(201);
        $this->assertSame(0, (int) $product->fresh()->stock_current);
    }

    public function test_rejects_order_for_zero_stock_product(): void
    {
        $product = $this->makeProduct()->fresh();
        Product::query()->where('id', $product->id)->update(['stock_current' => 0]);

        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]));

        $this->assertContains($response->getStatusCode(), [400, 422]);
    }

    public function test_multiple_items_atomically_check_stock(): void
    {
        $available = $this->makeProduct(['stock_current' => 10]);
        $depleted = $this->makeProduct(['stock_current' => 1]);

        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $available->id, 'quantity' => 2],
            ['id' => $depleted->id, 'quantity' => 5],
        ]));

        $this->assertContains($response->getStatusCode(), [400, 422]);

        $this->assertSame(10, (int) $available->fresh()->stock_current, 'Stock of OK product should be untouched when another item fails');
        $this->assertSame(1, (int) $depleted->fresh()->stock_current);
        $this->assertSame(0, Order::count());
    }

    public function test_correct_stock_after_quantity_two(): void
    {
        $product = $this->makeProduct(['stock_current' => 20]);
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 7],
        ]))->assertStatus(201);

        $this->assertSame(13, (int) $product->fresh()->stock_current);
    }
}
