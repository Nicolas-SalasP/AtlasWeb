<?php

namespace Tests\Feature\Order;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejects_request_with_empty_items_array(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/orders', $this->makeOrderPayload(items: []));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items']);
    }

    public function test_rejects_request_without_items_field(): void
    {
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([]);
        unset($payload['items']);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items']);
    }

    public function test_rejects_item_without_id(): void
    {
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['quantity' => 1]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.id']);
    }

    public function test_rejects_item_without_quantity(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_rejects_zero_quantity(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 0]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_rejects_negative_quantity(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => -5]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_rejects_quantity_above_max(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1000]]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_rejects_non_integer_quantity(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 'abc']]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_rejects_request_without_customer_data(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]]);
        unset($payload['customer_data']);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_data']);
    }

    public function test_rejects_customer_data_without_region(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'customer_data' => $this->makeCustomerData(['region' => '']),
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_data.region']);
    }

    public function test_rejects_invalid_email_in_customer_data(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'customer_data' => $this->makeCustomerData(['email' => 'no-es-email']),
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_data.email']);
    }

    public function test_rejects_request_without_terms_accepted(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'terms_accepted' => false,
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['terms_accepted']);
    }

    public function test_terms_accepted_must_be_truthy(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'terms_accepted' => 'no',
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['terms_accepted']);
    }

    public function test_rejects_shipping_address_too_long(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'shipping_address' => str_repeat('a', 501),
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['shipping_address']);
    }

    public function test_rejects_notes_too_long(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = $this->makeOrderPayload([['id' => $product->id, 'quantity' => 1]], [
            'notes' => str_repeat('x', 1001),
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['notes']);
    }

    public function test_accepts_missing_optional_fields(): void
    {
        $product = $this->makeProduct();
        $this->actingAsUser();

        $payload = [
            'items'           => [['id' => $product->id, 'quantity' => 1]],
            'customer_data'   => $this->makeCustomerData(),
            'terms_accepted'  => true,
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
    }
}
