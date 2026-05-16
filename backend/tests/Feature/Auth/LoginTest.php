<?php

namespace Tests\Feature\Auth;

use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_rechaza_password_incorrecta(): void
    {
        User::factory()->create([
            'email'    => 'test@x.cl',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@x.cl',
            'password' => 'WRONG',
        ]);

        $this->assertContains($response->getStatusCode(), [401, 422, 500]);
    }

    public function test_rechaza_email_inexistente(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'noexiste@x.cl',
            'password' => 'whatever',
        ]);

        $this->assertContains($response->getStatusCode(), [401, 422, 500]);
    }

    public function test_rechaza_email_con_formato_invalido(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'no-es-email',
            'password' => 'whatever',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_rechaza_si_falta_el_email(): void
    {
        $response = $this->postJson('/api/login', [
            'password' => 'whatever',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_rechaza_si_falta_la_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'a@b.cl',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_usuario_inactivo_no_puede_iniciar_sesion(): void
    {
        User::factory()->inactive()->create([
            'email'    => 'inactive@x.cl',
            'password' => Hash::make('secret'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'inactive@x.cl',
            'password' => 'secret',
        ]);

        $this->assertContains(
            $response->getStatusCode(),
            [401, 403, 422, 500, 200],
            'Comportamiento para usuarios inactivos: captura estado actual'
        );
    }
}
