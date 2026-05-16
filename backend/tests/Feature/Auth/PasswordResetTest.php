<?php

namespace Tests\Feature\Auth;

use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_responde_exito_para_email_existente(): void
    {
        User::factory()->create(['email' => 'exists@x.cl']);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'exists@x.cl',
        ]);

        $response->assertStatus(200);
    }

    public function test_forgot_password_no_enumera_usuarios(): void
    {
        User::factory()->create(['email' => 'exists@x.cl']);

        $existsResponse = $this->postJson('/api/forgot-password', ['email' => 'exists@x.cl']);
        $missingResponse = $this->postJson('/api/forgot-password', ['email' => 'doesnt@exist.cl']);

        $this->assertSame(
            $existsResponse->getStatusCode(),
            $missingResponse->getStatusCode(),
            'forgot-password debe responder mismo status para emails existentes vs inexistentes (evita user enumeration)'
        );
        $this->assertSame(
            $existsResponse->json('message'),
            $missingResponse->json('message'),
            'forgot-password debe responder mismo mensaje para emails existentes vs inexistentes (evita user enumeration)'
        );
    }

    public function test_forgot_password_registra_solo_para_usuarios_existentes(): void
    {
        $user = User::factory()->create(['email' => 'exists@x.cl']);

        $this->postJson('/api/forgot-password', ['email' => 'exists@x.cl']);
        $this->postJson('/api/forgot-password', ['email' => 'ghost@x.cl']);

        $this->assertDatabaseHas('access_logs', [
            'user_id' => $user->id,
            'action'  => 'Solicitud Recuperación de Contraseña',
        ]);

        $this->assertDatabaseMissing('access_logs', [
            'user_id' => null,
            'action'  => 'Solicitud Recuperación de Contraseña',
        ]);
    }

    public function test_forgot_password_rechaza_email_con_formato_invalido(): void
    {
        $response = $this->postJson('/api/forgot-password', ['email' => 'no-es-email']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_rechaza_si_falta_email(): void
    {
        $response = $this->postJson('/api/forgot-password', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_reset_password_rechaza_token_invalido(): void
    {
        User::factory()->create(['email' => 'reset@x.cl']);

        $response = $this->postJson('/api/reset-password', [
            'token'                 => 'token-totalmente-invalido',
            'email'                 => 'reset@x.cl',
            'password'              => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $this->assertContains($response->getStatusCode(), [400, 422]);
    }

    public function test_reset_password_con_token_valido_cambia_password(): void
    {
        $user = User::factory()->create([
            'email'    => 'reset@x.cl',
            'password' => Hash::make('old-password'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token'                 => $token,
            'email'                 => 'reset@x.cl',
            'password'              => 'brand-new-pass',
            'password_confirmation' => 'brand-new-pass',
        ]);

        $response->assertStatus(200);
        $user->refresh();
        $this->assertTrue(Hash::check('brand-new-pass', $user->password));
        $this->assertFalse(Hash::check('old-password', $user->password));
    }

    public function test_reset_password_rechaza_password_corta(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'token'                 => 'whatever',
            'email'                 => 'a@b.cl',
            'password'              => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_reset_password_rechaza_password_no_confirmada(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'token'                 => 'whatever',
            'email'                 => 'a@b.cl',
            'password'              => 'long-enough-pw',
            'password_confirmation' => 'completely-different-pw',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }
}
