<?php

namespace Tests\Feature\Order;

use App\Domain\Order\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_order_does_not_500_due_to_missing_status_logs_relation(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]));

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'order' => ['id'],
        ]);
    }

    public function test_order_resource_does_not_call_first_on_null(): void
    {
        $user = $this->actingAsUser();
        $order = Order::factory()->forUser($user)->create();

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200);
    }

    public function test_order_resource_returns_status_label_in_spanish(): void
    {
        $user = $this->actingAsUser();
        $order = Order::factory()->forUser($user)->pending()->create();

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'pending');
        $response->assertJsonPath('status_label', 'Pendiente de pago');
    }

    public function test_paid_order_returns_pagado_label(): void
    {
        $user = $this->actingAsUser();
        $order = Order::factory()->forUser($user)->paid()->create();

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('status_label', 'Pagado');
    }

    public function test_order_with_all_services_has_zero_shipping_cost(): void
    {
        $service = \App\Domain\Catalog\Models\Service::query()->create([
            'name'          => 'Plan ERP Mensual',
            'description'   => 'Suscripción mensual',
            'price'         => 25000,
            'duration_days' => 30,
            'is_active'     => true,
        ]);

        $this->actingAsUser();

        $payload = $this->makeOrderPayload([
            ['id' => "service-{$service->id}", 'quantity' => 1],
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();
        $this->assertSame(0, (int) $order->shipping_cost, 'Service-only order should have zero shipping');
    }

    public function test_order_with_physical_product_charges_shipping(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertGreaterThan(0, (int) $order->shipping_cost);
    }

    public function test_mixed_order_with_service_and_product_charges_shipping(): void
    {
        $service = \App\Domain\Catalog\Models\Service::query()->create([
            'name'          => 'Plan',
            'description'   => 'Plan',
            'price'         => 10000,
            'duration_days' => 30,
            'is_active'     => true,
        ]);
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([
            ['id' => "service-{$service->id}", 'quantity' => 1],
            ['id' => $product->id, 'quantity' => 1],
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();
        $this->assertGreaterThan(
            0,
            (int) $order->shipping_cost,
            'Mixed order must charge shipping because there is a physical product'
        );
    }

    public function test_response_returns_order_object_not_order_id_key(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]));

        $response->assertStatus(201);
        $response->assertJsonStructure(['order' => ['id']]);
    }

    public function test_unknown_region_falls_back_to_default_shipping_rate(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['customer_data' => $this->makeCustomerData(['region' => 'Atlantis'])],
        );

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();
        $this->assertSame(7990, (int) $order->shipping_cost);
    }

    public function test_order_creation_is_transactional_on_failure(): void
    {
        $this->actingAsUser();

        $countBefore = Order::count();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => 99999, 'quantity' => 1],
        ]));

        $this->assertGreaterThanOrEqual(400, $response->getStatusCode());
        $this->assertSame($countBefore, Order::count(), 'No partial order should be persisted on failure');
    }
}
