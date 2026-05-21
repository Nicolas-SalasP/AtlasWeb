<?php

namespace Tests\Feature\Auth;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private function payloadValido(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'Nicolas Test',
            'email'                 => 'nuevo@test.cl',
            'rut'                   => '11.111.111-1',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
        ], $overrides);
    }

    public function test_registra_usuario_con_datos_validos(): void
    {
        $response = $this->postJson('/api/register', $this->payloadValido());

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'nuevo@test.cl',
        ]);
    }

    public function test_nuevo_usuario_tiene_rol_cliente_por_defecto(): void
    {
        $this->postJson('/api/register', $this->payloadValido())->assertStatus(201);

        $user = User::where('email', 'nuevo@test.cl')->first();
        $this->assertSame(UserRole::Cliente->value, (int) $user->role_id);
    }

    public function test_nuevo_usuario_esta_activo_por_defecto(): void
    {
        $this->postJson('/api/register', $this->payloadValido())->assertStatus(201);

        $this->assertTrue((bool) User::where('email', 'nuevo@test.cl')->value('is_active'));
    }

    public function test_password_se_almacena_hasheada_y_no_en_texto_plano(): void
    {
        $this->postJson('/api/register', $this->payloadValido())->assertStatus(201);

        $stored = User::where('email', 'nuevo@test.cl')->value('password');
        $this->assertNotSame('password123', $stored);
        $this->assertTrue(Hash::check('password123', $stored));
    }

    public function test_aceptacion_de_terminos_queda_marcada_con_timestamp(): void
    {
        $this->postJson('/api/register', $this->payloadValido())->assertStatus(201);

        $this->assertNotNull(User::where('email', 'nuevo@test.cl')->value('terms_accepted_at'));
    }

    public function test_ip_de_aceptacion_de_terminos_se_almacena(): void
    {
        $this->postJson('/api/register', $this->payloadValido())->assertStatus(201);

        $ip = User::where('email', 'nuevo@test.cl')->value('terms_accepted_ip');
        $this->assertNotNull($ip);
    }

    public function test_rechaza_email_duplicado(): void
    {
        User::factory()->create(['email' => 'tomado@test.cl']);

        $response = $this->postJson('/api/register', $this->payloadValido(['email' => 'tomado@test.cl']));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_rechaza_rut_duplicado(): void
    {
        User::factory()->create(['rut' => '22.222.222-2']);

        $response = $this->postJson('/api/register', $this->payloadValido(['rut' => '22.222.222-2']));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rut']);
    }

    public function test_rechaza_email_con_formato_invalido(): void
    {
        $response = $this->postJson('/api/register', $this->payloadValido(['email' => 'no-es-email']));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_rechaza_password_mas_corta_que_el_minimo(): void
    {
        $response = $this->postJson('/api/register', $this->payloadValido([
            'password'              => 'short',
            'password_confirmation' => 'short',
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_rechaza_password_no_confirmada(): void
    {
        $response = $this->postJson('/api/register', $this->payloadValido([
            'password_confirmation' => 'mismatched12',
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_rechaza_si_no_se_aceptan_los_terminos(): void
    {
        $response = $this->postJson('/api/register', $this->payloadValido(['accept_terms' => false]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['accept_terms']);
    }

    public function test_rechaza_si_falta_el_nombre(): void
    {
        $payload = $this->payloadValido();
        unset($payload['name']);

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_rechaza_si_falta_el_rut(): void
    {
        $payload = $this->payloadValido();
        unset($payload['rut']);

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rut']);
    }
}
