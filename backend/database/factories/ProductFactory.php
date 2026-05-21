<?php

namespace Database\Factories;

use App\Domain\Product\Models\Category;
use App\Domain\Product\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->words(3, true);
        return [
            'sku'           => 'SKU-' . strtoupper(Str::random(8)),
            'name'          => ucfirst($name),
            'slug'          => Str::slug($name) . '-' . uniqid(),
            'description'   => fake()->sentence(),
            'price'         => fake()->numberBetween(5000, 100000),
            'cost_price'    => fake()->numberBetween(2000, 50000),
            'stock_current' => fake()->numberBetween(0, 100),
            'stock_alert'   => 5,
            'category_id'   => Category::factory(),
            'is_visible'    => true,
            'specs'         => null,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn () => ['stock_current' => 0]);
    }

    public function hidden(): static
    {
        return $this->state(fn () => ['is_visible' => false]);
    }

    public function withStock(int $stock): static
    {
        return $this->state(fn () => ['stock_current' => $stock]);
    }
}
