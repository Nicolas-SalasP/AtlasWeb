<?php

namespace Tests\Feature\Profile;

use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileShowUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_retorna_datos_del_usuario(): void
    {
        $user = $this->actingAsUser([
            'name'  => 'Juan Pérez',
            'email' => 'juan@x.cl',
        ]);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Juan Pérez']);
        $response->assertJsonFragment(['email' => 'juan@x.cl']);
    }

    public function test_show_incluye_rut(): void
    {
        $user = $this->actingAsUser(['rut' => '11.111.111-1']);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJsonFragment(['rut' => '11.111.111-1']);
    }

    public function test_show_sin_autenticar_retorna_401(): void
    {
        $response = $this->getJson('/api/profile');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_update_cambia_el_nombre(): void
    {
        $user = $this->actingAsUser(['name' => 'Antiguo Nombre']);

        $response = $this->putJson('/api/profile/update', [
            'name' => 'Nuevo Nombre',
        ]);

        $response->assertStatus(200);
        $this->assertSame('Nuevo Nombre', $user->fresh()->name);
    }

    public function test_update_cambia_el_telefono_cuando_se_envia(): void
    {
        $user = $this->actingAsUser(['phone' => '+56 9 0000 0000']);

        $response = $this->putJson('/api/profile/update', [
            'name'  => $user->name,
            'phone' => '+56 9 9999 9999',
        ]);

        $response->assertStatus(200);
        $this->assertSame('+56 9 9999 9999', $user->fresh()->phone);
    }

    public function test_update_preserva_telefono_cuando_no_se_envia(): void
    {
        $user = $this->actingAsUser(['phone' => '+56 9 5555 5555']);

        $response = $this->putJson('/api/profile/update', [
            'name' => 'Solo cambio nombre',
        ]);

        $response->assertStatus(200);
        $this->assertSame('+56 9 5555 5555', $user->fresh()->phone);
    }

    public function test_update_rechaza_si_falta_el_nombre(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile/update', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_update_rechaza_nombre_demasiado_largo(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile/update', [
            'name' => str_repeat('a', 256),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_update_rechaza_telefono_demasiado_largo(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile/update', [
            'name'  => 'OK',
            'phone' => str_repeat('1', 21),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['phone']);
    }

    public function test_update_no_permite_cambiar_email_por_este_endpoint(): void
    {
        $user = $this->actingAsUser(['email' => 'original@x.cl']);

        $this->putJson('/api/profile/update', [
            'name'  => 'Anything',
            'email' => 'attacker@evil.cl',
        ])->assertStatus(200);

        $this->assertSame('original@x.cl', $user->fresh()->email);
    }

    public function test_update_no_permite_cambiar_rol_por_este_endpoint(): void
    {
        $user = $this->actingAsUser(['role_id' => 2]);

        $this->putJson('/api/profile/update', [
            'name'    => 'OK',
            'role_id' => 1,
        ])->assertStatus(200);

        $this->assertSame(2, (int) $user->fresh()->role_id);
    }

    public function test_update_no_permite_cambiar_rut_por_este_endpoint(): void
    {
        $user = $this->actingAsUser(['rut' => '11.111.111-1']);

        $this->putJson('/api/profile/update', [
            'name' => 'OK',
            'rut'  => '99.999.999-9',
        ])->assertStatus(200);

        $this->assertSame('11.111.111-1', $user->fresh()->rut);
    }
}
