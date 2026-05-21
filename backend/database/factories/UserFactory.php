<?php

namespace Database\Factories;

use App\Domain\Billing\Support\RutValidator;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'role_id'        => 2,
            'name'           => fake()->name(),
            'rut'            => $this->generateRut(),
            'email'          => fake()->unique()->safeEmail(),
            'phone'          => '+56 9 ' . fake()->numerify('#### ####'),
            'password'       => static::$password ??= Hash::make('password'),
            'is_active'      => true,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role_id' => 1]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    private function generateRut(): string
    {
        do {
            $body = (string) random_int(10_000_000, 25_000_000);
            $dv = $this->computeDv($body);
            $rut = number_format((int) $body, 0, ',', '.') . '-' . $dv;
        } while (User::query()->where('rut', $rut)->exists());

        return $rut;
    }

    private function computeDv(string $body): string
    {
        $sum = 0;
        $multiplier = 2;

        for ($i = strlen($body) - 1; $i >= 0; $i--) {
            $sum += (int) $body[$i] * $multiplier;
            $multiplier = $multiplier === 7 ? 2 : $multiplier + 1;
        }

        $remainder = 11 - ($sum % 11);

        return match ($remainder) {
            11      => '0',
            10      => 'K',
            default => (string) $remainder,
        };
    }
}
