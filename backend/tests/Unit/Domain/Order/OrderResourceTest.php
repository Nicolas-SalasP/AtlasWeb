<?php

namespace Tests\Unit\Domain\Order;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Http\Resources\Order\OrderResource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class OrderResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_serializes_order_without_status_logs_loaded(): void
    {
        $order = Order::factory()->create();

        $resource = new OrderResource($order);
        $array = $resource->toArray(new Request());

        $this->assertArrayHasKey('id', $array);
        $this->assertSame($order->id, $array['id']);
    }

    public function test_serializes_order_without_items_loaded(): void
    {
        $order = Order::factory()->create();

        $resource = new OrderResource($order);
        $array = $resource->toArray(new Request());

        $this->assertIsArray($array);
        $this->assertArrayHasKey('id', $array);
    }

    public function test_json_serialization_does_not_throw_on_missing_relations(): void
    {
        $order = Order::factory()->create();

        $json = (new OrderResource($order))->response()->getContent();

        $this->assertIsString($json);
        $decoded = json_decode($json, true);
        $this->assertIsArray($decoded);
        $this->assertNotEmpty($decoded);
    }

    public function test_returns_status_label_in_spanish(): void
    {
        $order = Order::factory()->paid()->create();

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertSame('paid', $array['status']);
        $this->assertSame('Pagado', $array['status_label']);
    }

    public function test_pending_order_has_correct_status_label(): void
    {
        $order = Order::factory()->pending()->create();

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertSame('Pendiente de pago', $array['status_label']);
    }

    public function test_returns_subtotal_shipping_cost_and_total_as_integers(): void
    {
        $order = Order::factory()->create([
            'subtotal'      => 15000,
            'shipping_cost' => 3990,
            'total'         => 18990,
        ]);

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertIsInt($array['subtotal']);
        $this->assertIsInt($array['shipping_cost']);
        $this->assertIsInt($array['total']);
        $this->assertSame(15000, $array['subtotal']);
        $this->assertSame(3990, $array['shipping_cost']);
        $this->assertSame(18990, $array['total']);
    }

    public function test_returns_order_number_and_shipping_address(): void
    {
        $order = Order::factory()->create([
            'order_number'     => 'ORD-XYZ-123',
            'shipping_address' => 'Calle Test 999',
        ]);

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertSame('ORD-XYZ-123', $array['order_number']);
        $this->assertSame('Calle Test 999', $array['shipping_address']);
    }

    public function test_returns_customer_data_array(): void
    {
        $order = Order::factory()->create([
            'customer_data' => ['nombre' => 'Específico', 'email' => 'a@b.cl'],
        ]);

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertSame(['nombre' => 'Específico', 'email' => 'a@b.cl'], $array['customer_data']);
    }

    public function test_returns_iso_timestamps(): void
    {
        $order = Order::factory()->create();

        $array = (new OrderResource($order))->toArray(new Request());

        $this->assertIsString($array['created_at']);
        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/',
            $array['created_at']
        );
    }
}
