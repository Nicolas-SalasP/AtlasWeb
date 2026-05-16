<?php

namespace Tests\Feature\Profile;

use App\Domain\User\Enums\AccessAction;
use App\Domain\User\Models\AccessLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_autenticado_no_puede_acceder_a_los_logs(): void
    {
        $response = $this->getJson('/api/profile/security-logs');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_retorna_logs_del_usuario_autenticado(): void
    {
        $user = $this->actingAsUser();

        AccessLog::factory()->count(3)->create([
            'user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/profile/security-logs');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(3, count($response->json()));
    }

    public function test_no_filtra_logs_de_otros_usuarios(): void
    {
        $other = \App\Domain\User\Models\User::factory()->create();
        AccessLog::factory()->count(5)->create(['user_id' => $other->id]);

        $self = $this->actingAsUser();
        AccessLog::factory()->count(2)->create(['user_id' => $self->id]);

        $response = $this->getJson('/api/profile/security-logs');

        $response->assertStatus(200);
        $logs = $response->json();
        $this->assertCount(2, $logs, 'Usuario solo debe ver sus propios logs');
    }

    public function test_extrae_el_dispositivo_desde_user_agent(): void
    {
        $user = $this->actingAsUser();

        AccessLog::factory()->fromMobile()->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/profile/security-logs');

        $response->assertStatus(200);
        $first = $response->json()[0];

        $this->assertArrayHasKey('device', $first);
        $this->assertSame('Mobile', $first['device']);
    }

    public function test_extrae_el_navegador_desde_user_agent(): void
    {
        $user = $this->actingAsUser();

        AccessLog::factory()->create([
            'user_id'    => $user->id,
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0) Firefox/120.0',
        ]);

        $response = $this->getJson('/api/profile/security-logs');

        $first = $response->json()[0];
        $this->assertArrayHasKey('browser', $first);
        $this->assertSame('Firefox', $first['browser']);
    }

    public function test_retorna_logs_de_login_fallido_con_la_accion_correcta(): void
    {
        $user = $this->actingAsUser();
        AccessLog::factory()->loginFailure()->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/profile/security-logs');

        $body = json_encode($response->json());
        $this->assertStringContainsString('Intento de Login Fallido', $body);
    }

    public function test_respuesta_incluye_ip_y_ubicacion(): void
    {
        $user = $this->actingAsUser();
        AccessLog::factory()->create([
            'user_id'    => $user->id,
            'ip_address' => '203.0.113.42',
            'city'       => 'Santiago',
            'region'     => 'Metropolitana',
        ]);

        $response = $this->getJson('/api/profile/security-logs');

        $first = $response->json()[0];
        $this->assertSame('203.0.113.42', $first['ip']);
        $this->assertStringContainsString('Santiago', $first['location']);
    }

    public function test_ubicacion_desconocida_retorna_fallback(): void
    {
        $user = $this->actingAsUser();
        AccessLog::factory()->create([
            'user_id' => $user->id,
            'city'    => null,
            'region'  => null,
        ]);

        $response = $this->getJson('/api/profile/security-logs');

        $first = $response->json()[0];
        $this->assertSame('Ubicación desconocida', $first['location']);
    }
}
