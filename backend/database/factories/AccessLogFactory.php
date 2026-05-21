<?php

namespace Database\Factories;

use App\Domain\User\Enums\AccessAction;
use App\Domain\User\Models\AccessLog;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccessLogFactory extends Factory
{
    protected $model = AccessLog::class;

    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'ip_address' => fake()->ipv4(),
            'city'       => fake()->city(),
            'region'     => 'Metropolitana',
            'action'     => AccessAction::LoginSuccess->value,
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
            'created_at' => now(),
        ];
    }

    public function loginFailure(): static
    {
        return $this->state(fn () => ['action' => AccessAction::LoginFailure->value]);
    }

    public function logout(): static
    {
        return $this->state(fn () => ['action' => AccessAction::Logout->value]);
    }

    public function passwordChanged(): static
    {
        return $this->state(fn () => ['action' => AccessAction::PasswordChanged->value]);
    }

    public function fromMobile(): static
    {
        return $this->state(fn () => [
            'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1',
        ]);
    }
}
