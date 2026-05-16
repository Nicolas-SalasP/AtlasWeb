<?php

namespace Database\Factories;

use App\Domain\User\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'name'        => fake()->unique()->jobTitle(),
            'permissions' => null,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'name'        => 'Administrador',
            'permissions' => ['all' => true],
        ]);
    }

    public function cliente(): static
    {
        return $this->state(fn () => [
            'name'        => 'Cliente',
            'permissions' => null,
        ]);
    }
}
