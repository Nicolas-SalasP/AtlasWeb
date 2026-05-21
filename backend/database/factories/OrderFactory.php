<?php

namespace Database\Factories;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal     = fake()->numberBetween(10000, 200000);
        $shippingCost = 3990;

        return [
            'order_number'     => 'ORD-' . strtoupper(uniqid()),
            'user_id'          => User::factory(),
            'rut'              => '12.345.678-5',
            'subtotal'         => $subtotal,
            'shipping_cost'    => $shippingCost,
            'total'            => $subtotal + $shippingCost,
            'status'           => OrderStatus::Pending->value,
            'shipping_address' => 'Av. Siempreviva 123, Springfield, Metropolitana',
            'customer_data'    => [
                'nombre'         => 'Cliente Test',
                'rut'            => '12.345.678-5',
                'email'          => 'cliente@test.cl',
                'phone'          => '+56 912345678',
                'region'         => 'Metropolitana',
                'tipo_documento' => 'Boleta',
            ],
            'notes'             => null,
            'shipping_provider' => null,
            'tracking_number'   => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Pending->value]);
    }

    public function paid(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Paid->value]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Cancelled->value]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn () => ['user_id' => $user->id]);
    }
}
