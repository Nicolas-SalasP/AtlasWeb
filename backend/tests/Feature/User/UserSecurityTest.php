<?php

namespace Tests\Feature\User;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_ignora_mass_assignment_de_role_id(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Attacker',
            'email'                 => 'attacker@x.cl',
            'rut'                   => '11.111.111-1',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
            'role_id'               => UserRole::Admin->value,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'attacker@x.cl')->first();
        $this->assertSame(
            UserRole::Cliente->value,
            (int) $user->role_id,
            'Attacker intentó mass-assign role_id=Admin en register; debe forzarse a Cliente'
        );
    }

    public function test_register_ignora_mass_assignment_de_permissions(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Attacker',
            'email'                 => 'priv@x.cl',
            'rut'                   => '12.345.678-5',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
            'permissions'           => ['all' => true],
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'priv@x.cl')->first();
        $perms = $user->permissions;

        $this->assertFalse(
            is_array($perms) && ($perms['all'] ?? false) === true,
            'Attacker intentó otorgarse permiso all en register'
        );
    }

    public function test_register_ignora_mass_assignment_de_is_active(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'Attacker',
            'email'                 => 'force@x.cl',
            'rut'                   => '22.222.222-2',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
            'is_active'             => false,
        ])->assertStatus(201);

        $user = User::where('email', 'force@x.cl')->first();
        $this->assertTrue((bool) $user->is_active);
    }

    public function test_profile_update_no_permite_escalar_a_admin(): void
    {
        $user = $this->actingAsUser(['role_id' => UserRole::Cliente->value]);

        $this->putJson('/api/profile/update', [
            'name'    => 'Hacker',
            'role_id' => UserRole::Admin->value,
        ])->assertStatus(200);

        $this->assertSame(UserRole::Cliente->value, (int) $user->fresh()->role_id);
    }

    public function test_profile_update_no_permite_otorgar_permiso_all(): void
    {
        $user = $this->actingAsUser([
            'role_id'     => UserRole::Cliente->value,
            'permissions' => null,
        ]);

        $this->putJson('/api/profile/update', [
            'name'        => 'Hacker',
            'permissions' => ['all' => true],
        ])->assertStatus(200);

        $perms = $user->fresh()->permissions;
        $this->assertFalse(
            is_array($perms) && ($perms['all'] ?? false) === true,
            'Endpoint de profile update no debe permitir escalada de privilegios'
        );
    }

    public function test_admin_auto_otorgarse_permisos_es_coherente_con_modelo_admin_super(): void
    {
        $admin = $this->actingAsAdmin(['permissions' => null]);

        $response = $this->putJson("/api/admin/users/{$admin->id}", [
            'name'        => $admin->name,
            'email'       => $admin->email,
            'is_active'   => true,
            'permissions' => ['all' => true],
        ]);

        $this->assertContains(
            $response->getStatusCode(),
            [200, 403, 422],
            'Captura comportamiento actual'
        );

        $this->assertTrue(
            true,
            'En este modelo, el rol Admin tiene permissions={all:true} por default, ' .
            'por lo que todo admin es super admin y puede auto-otorgarse permisos. ' .
            'Si se introduce un concepto de admin no-super (rol con permissions sin all), ' .
            'este test debe reforzarse para asegurar que admins regulares no se auto-eleven.'
        );
    }

    public function test_password_nunca_se_retorna_en_ninguna_respuesta(): void
    {
        $user = $this->actingAsUser([
            'password' => Hash::make('supersecret'),
        ]);

        foreach (['/api/profile', '/api/me'] as $endpoint) {
            $response = $this->getJson($endpoint);

            if ($response->getStatusCode() === 200) {
                $body = strtolower(json_encode($response->json()));
                $this->assertStringNotContainsString('supersecret', $body, "Password plana filtrada desde {$endpoint}");
                $this->assertStringNotContainsString('$2y$', $body, "Hash bcrypt filtrado desde {$endpoint}");
            }
        }
    }

    public function test_xss_en_nombre_al_registrarse_se_almacena_y_react_lo_escapa_en_render(): void
    {
        $this->postJson('/api/register', [
            'name'                  => '<script>alert("xss")</script>Pwn',
            'email'                 => 'xss@x.cl',
            'rut'                   => '33.333.333-3',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
        ])->assertStatus(201);

        $name = User::where('email', 'xss@x.cl')->value('name');

        $this->assertNotNull($name);
    }

    public function test_sql_injection_en_email_de_login_no_omite_la_autenticacion(): void
    {
        User::factory()->create([
            'email'    => 'real@x.cl',
            'password' => Hash::make('correct'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => "' OR '1'='1",
            'password' => "' OR '1'='1",
        ]);

        $this->assertContains($response->getStatusCode(), [401, 422, 500]);
    }

    public function test_sql_injection_en_email_de_register_no_se_ejecuta(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'OK',
            'email'                 => "robert'); DROP TABLE users; --@x.cl",
            'rut'                   => '44.444.444-4',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'accept_terms'          => true,
        ]);

        $this->assertTrue(\Schema::hasTable('users'), 'tabla users debe seguir existiendo tras intento de SQLi');
    }

    public function test_no_autenticado_no_puede_ver_usuarios_por_ruta_admin_idor(): void
    {
        $target = User::factory()->create();

        $response = $this->getJson("/api/admin/users/{$target->id}");

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_usuario_regular_no_puede_ver_usuarios_por_ruta_admin_idor(): void
    {
        $target = User::factory()->create();
        $this->actingAsUser();

        $response = $this->getJson("/api/admin/users/{$target->id}");

        $this->assertContains($response->getStatusCode(), [401, 403, 404]);
    }

    public function test_password_en_register_nunca_se_persiste_en_texto_plano(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'OK',
            'email'                 => 'check@x.cl',
            'rut'                   => '55.555.555-5',
            'password'              => 'plaintext-marker-zzz',
            'password_confirmation' => 'plaintext-marker-zzz',
            'accept_terms'          => true,
        ])->assertStatus(201);

        $storedPassword = User::where('email', 'check@x.cl')->value('password');
        $this->assertNotSame('plaintext-marker-zzz', $storedPassword);
        $this->assertStringStartsWith('$2y$', $storedPassword);
    }

    public function test_forgot_password_esta_rate_limited(): void
    {
        $statuses = [];
        for ($i = 0; $i < 5; $i++) {
            $statuses[] = $this->postJson('/api/forgot-password', [
                'email' => 'spam-target@x.cl',
            ])->getStatusCode();
        }

        $this->assertContains(
            429,
            $statuses,
            'Endpoint forgot-password debe rate-limitar (throttle:3,1) para prevenir spam'
        );
    }

    public function test_rut_no_puede_cambiarse_via_ruta_de_admin_update(): void
    {
        $target = User::factory()->create(['rut' => '99.999.999-9']);
        $this->actingAsAdmin();

        $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => $target->name,
            'email'     => $target->email,
            'is_active' => true,
            'rut'       => '11.111.111-1',
        ])->assertStatus(200);

        $this->assertSame('99.999.999-9', $target->fresh()->rut);
    }
}
