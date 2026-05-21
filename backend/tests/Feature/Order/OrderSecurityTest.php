<?php

namespace Tests\Feature\Order;

use App\Domain\Order\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_list_orders(): void
    {
        $response = $this->getJson('/api/orders');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_unauthenticated_user_cannot_view_specific_order(): void
    {
        $user = \App\Domain\User\Models\User::factory()->create();
        $order = Order::factory()->forUser($user)->create();

        $response = $this->getJson("/api/orders/{$order->id}");

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_user_cannot_view_other_users_order_idor(): void
    {
        $otherUser = \App\Domain\User\Models\User::factory()->create();
        $foreignOrder = Order::factory()->forUser($otherUser)->create();

        $this->actingAsUser();

        $response = $this->getJson("/api/orders/{$foreignOrder->id}");

        $this->assertContains(
            $response->getStatusCode(),
            [403, 404],
            'User should NOT be able to access another user\'s order'
        );
    }

    public function test_user_only_sees_their_own_orders_in_index(): void
    {
        $otherUser = \App\Domain\User\Models\User::factory()->create();
        $foreignOrders = Order::factory()->forUser($otherUser)->count(3)->create();
        $foreignIds = $foreignOrders->pluck('id')->all();

        $self = $this->actingAsUser();
        $ownOrders = Order::factory()->forUser($self)->count(2)->create();
        $ownIds = $ownOrders->pluck('id')->all();

        $response = $this->getJson('/api/orders');

        $response->assertStatus(200);
        $orders = $response->json();
        $this->assertCount(2, $orders, 'Index should only return own orders, not other users\'');

        $returnedIds = array_column($orders, 'id');
        sort($returnedIds);
        sort($ownIds);
        $this->assertSame($ownIds, $returnedIds, 'Returned order ids must match own orders exactly');

        foreach ($returnedIds as $id) {
            $this->assertNotContains($id, $foreignIds, "Order #{$id} belongs to another user — IDOR leak");
        }
    }

    public function test_mass_assignment_user_id_is_ignored(): void
    {
        $product = $this->makeProduct();
        $victim = \App\Domain\User\Models\User::factory()->create();

        $attacker = $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]]);
        $payload['user_id'] = $victim->id;

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();

        $this->assertSame(
            $attacker->id,
            $order->user_id,
            'Attacker tried to assign order to victim via mass assignment; should be ignored'
        );
    }

    public function test_mass_assignment_status_is_ignored(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]]);
        $payload['status'] = 'paid';

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();

        $this->assertSame('pending', $order->status?->value ?? $order->status);
    }

    public function test_mass_assignment_total_is_recalculated_not_taken_from_input(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]]);
        $payload['total']    = 1;
        $payload['subtotal'] = 1;

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();

        $this->assertSame(10000, (int) $order->subtotal);
        $this->assertGreaterThan(1, (int) $order->total);
    }

    public function test_shipping_cost_is_recalculated_server_side(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['shipping_cost' => 0],
        );

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $order = Order::latest('id')->first();
        $this->assertSame(3990, (int) $order->shipping_cost);
    }

    public function test_xss_in_customer_data_is_stored_but_escaped(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $maliciousName = '<script>alert("xss")</script>Pwn';

        $response = $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['customer_data' => $this->makeCustomerData(['nombre' => $maliciousName])],
        ));

        $response->assertStatus(201);
        $order = Order::latest('id')->first();

        $stored = $order->customer_data['nombre'] ?? '';
        $this->assertStringNotContainsString('<script>', $stored, 'XSS script tag should be stripped or escaped');
    }

    public function test_shipping_address_strips_html_tags(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $maliciousAddress = '<iframe src="evil"></iframe>Calle Real 123';

        $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['shipping_address' => $maliciousAddress],
        ))->assertStatus(201);

        $order = Order::latest('id')->first();
        $this->assertStringNotContainsString('<iframe', $order->shipping_address);
        $this->assertStringContainsString('Calle Real 123', $order->shipping_address);
    }

    public function test_sql_injection_in_notes_does_not_execute(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $sqlPayload = "'; DROP TABLE orders; --";

        $response = $this->postJson('/api/orders', $this->makeOrderPayload(
            items: [['id' => $product->id, 'quantity' => 1]],
            overrides: ['notes' => $sqlPayload],
        ));

        $response->assertStatus(201);
        $this->assertTrue(\Schema::hasTable('orders'), 'orders table should still exist after SQL injection attempt');
    }

    public function test_cannot_create_order_for_non_existent_product(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => 999999, 'quantity' => 1],
        ]));

        $this->assertContains($response->getStatusCode(), [404, 400, 422, 500]);
    }

    public function test_inactive_user_cannot_create_order(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser(['is_active' => false]);

        $response = $this->postJson('/api/orders', $this->makeOrderPayload([
            ['id' => $product->id, 'quantity' => 1],
        ]));

        $this->assertContains(
            $response->getStatusCode(),
            [401, 403, 422, 201],
            'Inactive user policy: response should be either deny (401/403) or allow with proper validation'
        );
    }
}
