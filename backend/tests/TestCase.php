<?php

namespace Tests;

use App\Domain\Product\Models\Category;
use App\Domain\Product\Models\Product;
use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    protected function actingAsUser(array $overrides = []): User
    {
        $user = User::factory()->create($overrides);
        Sanctum::actingAs($user);
        return $user;
    }

    protected function actingAsAdmin(array $overrides = []): User
    {
        return $this->actingAsUser(array_merge(['role_id' => 1], $overrides));
    }

    protected function makeProduct(array $overrides = []): Product
    {
        $category = Category::factory()->create();
        return Product::factory()->create(array_merge([
            'category_id'   => $category->id,
            'price'         => 10000,
            'stock_current' => 50,
            'is_visible'    => true,
        ], $overrides));
    }

    protected function makeCustomerData(array $overrides = []): array
    {
        return array_merge([
            'nombre'         => 'Cliente Test',
            'rut'            => '12.345.678-5',
            'email'          => 'cliente@test.cl',
            'phone'          => '+56 912345678',
            'region'         => 'Metropolitana',
            'tipo_documento' => 'Boleta',
        ], $overrides);
    }

    protected function makeOrderPayload(array $items, array $overrides = []): array
    {
        return array_merge([
            'items'            => $items,
            'shipping_cost'    => 3990,
            'shipping_address' => 'Av. Siempreviva 123, Springfield, Metropolitana',
            'customer_data'    => $this->makeCustomerData(),
            'notes'            => null,
            'terms_accepted'   => true,
        ], $overrides);
    }
}
