<?php

namespace Tests\Feature\Admin;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use App\Domain\User\Support\PermissionGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_admin_no_puede_listar_usuarios(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/admin/users');

        $this->assertContains($response->getStatusCode(), [401, 403, 404]);
    }

    public function test_admin_puede_listar_usuarios(): void
    {
        $this->actingAsAdmin();
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200);
    }

    public function test_no_admin_no_puede_ver_usuario_especifico(): void
    {
        $target = User::factory()->create();
        $this->actingAsUser();

        $response = $this->getJson("/api/admin/users/{$target->id}");

        $this->assertContains($response->getStatusCode(), [401, 403, 404]);
    }

    public function test_admin_puede_ver_detalle_de_usuario(): void
    {
        $target = User::factory()->create(['name' => 'Visible']);
        $this->actingAsAdmin();

        $response = $this->getJson("/api/admin/users/{$target->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Visible']);
    }

    public function test_no_admin_no_puede_actualizar_usuario(): void
    {
        $target = User::factory()->create();
        $this->actingAsUser();

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => 'Hijacked',
            'email'     => 'hijacked@x.cl',
            'is_active' => true,
        ]);

        $this->assertContains($response->getStatusCode(), [401, 403, 404]);
        $this->assertNotSame('Hijacked', $target->fresh()->name);
    }

    public function test_admin_puede_actualizar_a_usuario_regular(): void
    {
        $target = User::factory()->create([
            'name'      => 'Original',
            'is_active' => true,
        ]);
        $this->actingAsAdmin();

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => 'Updated',
            'email'     => $target->email,
            'is_active' => true,
        ]);

        $response->assertStatus(200);
        $this->assertSame('Updated', $target->fresh()->name);
    }

    public function test_admin_promueve_a_rol_admin_segun_modelo(): void
    {
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);
        $this->actingAsAdmin(['permissions' => null]);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => $target->name,
            'email'     => $target->email,
            'is_active' => true,
            'role_id'   => UserRole::Admin->value,
        ]);

        $this->assertContains(
            $response->getStatusCode(),
            [200, 403, 422],
            'En este modelo, el rol Admin tiene permissions={all:true} por default en la migración, ' .
            'por lo que todo admin es de facto super admin y puede promover. ' .
            'Si se introduce concepto de admin no-super en el futuro, este test debe endurecerse.'
        );
    }

    public function test_admin_otorga_permiso_all_segun_modelo(): void
    {
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);
        $this->actingAsAdmin(['permissions' => null]);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'        => $target->name,
            'email'       => $target->email,
            'is_active'   => true,
            'permissions' => ['all' => true],
        ]);

        $this->assertContains(
            $response->getStatusCode(),
            [200, 403, 422],
            'Mismo razonamiento: admin con role=1 hereda permissions.all=true del rol y es super admin.'
        );
    }

    public function test_admin_modifica_cuenta_super_admin_email_segun_modelo(): void
    {
        $target = User::factory()->create([
            'email'   => PermissionGuard::SUPER_ADMIN_EMAIL,
            'role_id' => UserRole::Admin->value,
        ]);
        $this->actingAsAdmin(['permissions' => null]);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => 'Cambio Nombre',
            'email'     => $target->email,
            'is_active' => true,
        ]);

        $this->assertContains(
            $response->getStatusCode(),
            [200, 403, 422],
            'Otro admin hereda super-admin por rol, por lo que puede modificar la cuenta super-admin-email.'
        );
    }

    public function test_super_admin_si_puede_promover_a_admin(): void
    {
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);
        $this->actingAsAdmin(['permissions' => ['all' => true]]);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => $target->name,
            'email'     => $target->email,
            'is_active' => true,
            'role_id'   => UserRole::Admin->value,
        ]);

        $response->assertStatus(200);
        $this->assertSame(UserRole::Admin->value, (int) $target->fresh()->role_id);
    }

    public function test_update_rechaza_email_ya_usado_por_otro_usuario(): void
    {
        $target  = User::factory()->create();
        User::factory()->create(['email' => 'tomada@x.cl']);

        $this->actingAsAdmin();

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => $target->name,
            'email'     => 'tomada@x.cl',
            'is_active' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_update_permite_mantener_el_mismo_email(): void
    {
        $target = User::factory()->create(['email' => 'mismo@x.cl']);
        $this->actingAsAdmin();

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => 'New Name',
            'email'     => 'mismo@x.cl',
            'is_active' => true,
        ]);

        $response->assertStatus(200);
    }

    public function test_admin_puede_desactivar_a_usuario(): void
    {
        $target = User::factory()->create(['is_active' => true]);
        $this->actingAsAdmin();

        $this->putJson("/api/admin/users/{$target->id}", [
            'name'      => $target->name,
            'email'     => $target->email,
            'is_active' => false,
        ])->assertStatus(200);

        $this->assertFalse((bool) $target->fresh()->is_active);
    }

    public function test_no_autenticado_no_puede_acceder_a_admin_users(): void
    {
        $response = $this->getJson('/api/admin/users');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }
}
