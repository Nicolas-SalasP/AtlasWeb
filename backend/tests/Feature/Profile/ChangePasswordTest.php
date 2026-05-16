<?php

namespace Tests\Feature\Profile;

use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_cambia_password_con_password_actual_correcta(): void
    {
        $user = $this->actingAsUser([
            'password' => Hash::make('actual-password'),
        ]);

        $response = $this->putJson('/api/profile/password', [
            'current_password'          => 'actual-password',
            'new_password'              => 'brand-new-password',
            'new_password_confirmation' => 'brand-new-password',
        ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('brand-new-password', $user->fresh()->password));
    }

    public function test_rechaza_password_actual_incorrecta(): void
    {
        $this->actingAsUser([
            'password' => Hash::make('correct'),
        ]);

        $response = $this->putJson('/api/profile/password', [
            'current_password'          => 'guess-wrong',
            'new_password'              => 'long-enough-pass',
            'new_password_confirmation' => 'long-enough-pass',
        ]);

        $this->assertContains($response->getStatusCode(), [400, 401, 422]);
    }

    public function test_rechaza_nueva_password_mas_corta_que_el_minimo(): void
    {
        $this->actingAsUser(['password' => Hash::make('actual')]);

        $response = $this->putJson('/api/profile/password', [
            'current_password'          => 'actual',
            'new_password'              => 'short',
            'new_password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['new_password']);
    }

    public function test_rechaza_nueva_password_no_confirmada(): void
    {
        $this->actingAsUser(['password' => Hash::make('actual')]);

        $response = $this->putJson('/api/profile/password', [
            'current_password'          => 'actual',
            'new_password'              => 'long-enough-pass',
            'new_password_confirmation' => 'different-confirmation',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['new_password']);
    }

    public function test_rechaza_si_falta_password_actual(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile/password', [
            'new_password'              => 'long-enough-pass',
            'new_password_confirmation' => 'long-enough-pass',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_rechaza_si_falta_nueva_password(): void
    {
        $this->actingAsUser(['password' => Hash::make('actual')]);

        $response = $this->putJson('/api/profile/password', [
            'current_password' => 'actual',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['new_password']);
    }

    public function test_usuario_no_autenticado_no_puede_cambiar_password(): void
    {
        $response = $this->putJson('/api/profile/password', [
            'current_password'          => 'a',
            'new_password'              => 'long-enough-pass',
            'new_password_confirmation' => 'long-enough-pass',
        ]);

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_nueva_password_se_almacena_hasheada(): void
    {
        $user = $this->actingAsUser(['password' => Hash::make('actual')]);

        $this->putJson('/api/profile/password', [
            'current_password'          => 'actual',
            'new_password'              => 'plaintext-new',
            'new_password_confirmation' => 'plaintext-new',
        ])->assertStatus(200);

        $storedHash = $user->fresh()->password;
        $this->assertNotSame('plaintext-new', $storedHash);
        $this->assertStringStartsWith('$2y$', $storedHash);
    }

    public function test_password_antigua_deja_de_funcionar_tras_el_cambio(): void
    {
        $user = $this->actingAsUser(['password' => Hash::make('old-pw')]);

        $this->putJson('/api/profile/password', [
            'current_password'          => 'old-pw',
            'new_password'              => 'new-pw-12345',
            'new_password_confirmation' => 'new-pw-12345',
        ])->assertStatus(200);

        $this->assertFalse(Hash::check('old-pw', $user->fresh()->password));
    }

    public function test_cambiar_password_no_modifica_email_ni_rut(): void
    {
        $user = $this->actingAsUser([
            'email'    => 'preserved@x.cl',
            'rut'      => '11.111.111-1',
            'password' => Hash::make('actual'),
        ]);

        $this->putJson('/api/profile/password', [
            'current_password'          => 'actual',
            'new_password'              => 'long-enough-pass',
            'new_password_confirmation' => 'long-enough-pass',
        ])->assertStatus(200);

        $fresh = $user->fresh();
        $this->assertSame('preserved@x.cl', $fresh->email);
        $this->assertSame('11.111.111-1', $fresh->rut);
    }
}
