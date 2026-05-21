<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Exceptions\ForbiddenUserOperationException;
use App\Domain\User\Models\User;
use App\Domain\User\Support\PermissionGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_es_super_admin_si_tiene_permiso_all_en_user_permissions(): void
    {
        $user = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => true],
        ]);

        $this->assertTrue(PermissionGuard::isSuperAdmin($user));
    }

    public function test_no_es_super_admin_si_es_cliente_sin_permisos(): void
    {
        $user = User::factory()->create([
            'role_id'     => UserRole::Cliente->value,
            'permissions' => null,
        ]);

        $this->assertFalse(PermissionGuard::isSuperAdmin($user));
    }

    public function test_no_es_super_admin_si_all_es_false_explicitamente(): void
    {
        $user = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => false],
        ]);

        $this->assertFalse(PermissionGuard::isSuperAdmin($user));
    }

    public function test_admin_con_permissions_null_hereda_super_admin_del_rol(): void
    {
        $user = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => null,
        ]);
        $user->load('role');

        $this->assertTrue(
            PermissionGuard::isSuperAdmin($user),
            'En este modelo, el rol Admin tiene permissions={all:true} en la migración. ' .
            'Cuando user.permissions es null, isSuperAdmin hace fallback al rol y retorna true. ' .
            'Es decir: todo usuario con role_id=Admin y permissions=null es super admin por default.'
        );
    }

    public function test_cliente_no_puede_modificar_cuenta_super_admin_email(): void
    {
        $actor  = User::factory()->create(['role_id' => UserRole::Cliente->value, 'permissions' => null]);
        $target = User::factory()->create(['email' => PermissionGuard::SUPER_ADMIN_EMAIL]);

        $this->expectException(ForbiddenUserOperationException::class);

        PermissionGuard::ensureCanModifyTarget($actor, $target, ['name' => 'Anything']);
    }

    public function test_admin_si_puede_modificar_cuenta_super_admin_email(): void
    {
        $actor = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => true],
        ]);
        $target = User::factory()->create(['email' => PermissionGuard::SUPER_ADMIN_EMAIL]);

        PermissionGuard::ensureCanModifyTarget($actor, $target, ['name' => 'New Name']);

        $this->assertTrue(true);
    }

    public function test_super_admin_email_no_puede_ser_degradado_de_rol_admin(): void
    {
        $actor = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => true],
        ]);
        $target = User::factory()->create([
            'role_id' => UserRole::Admin->value,
            'email'   => PermissionGuard::SUPER_ADMIN_EMAIL,
        ]);

        $this->expectException(ForbiddenUserOperationException::class);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'role_id' => UserRole::Cliente->value,
        ]);
    }

    public function test_cliente_no_puede_promover_a_otros_a_rol_admin(): void
    {
        $actor  = User::factory()->create(['role_id' => UserRole::Cliente->value, 'permissions' => null]);
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);

        $this->expectException(ForbiddenUserOperationException::class);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'role_id' => UserRole::Admin->value,
        ]);
    }

    public function test_cliente_no_puede_otorgar_permiso_all(): void
    {
        $actor  = User::factory()->create(['role_id' => UserRole::Cliente->value, 'permissions' => null]);
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);

        $this->expectException(ForbiddenUserOperationException::class);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'permissions' => ['all' => true],
        ]);
    }

    public function test_admin_con_all_si_puede_otorgar_permiso_all(): void
    {
        $actor  = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => true],
        ]);
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'permissions' => ['all' => true],
        ]);

        $this->assertTrue(true);
    }

    public function test_admin_con_all_si_puede_promover_a_admin(): void
    {
        $actor  = User::factory()->create([
            'role_id'     => UserRole::Admin->value,
            'permissions' => ['all' => true],
        ]);
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value]);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'role_id' => UserRole::Admin->value,
        ]);

        $this->assertTrue(true);
    }

    public function test_admin_puede_modificar_a_usuario_regular(): void
    {
        $actor  = User::factory()->create(['role_id' => UserRole::Admin->value, 'permissions' => null]);
        $target = User::factory()->create(['role_id' => UserRole::Cliente->value, 'permissions' => null]);

        PermissionGuard::ensureCanModifyTarget($actor, $target, [
            'name'      => 'Updated',
            'is_active' => false,
        ]);

        $this->assertTrue(true);
    }

    public function test_constante_super_admin_email_tiene_valor_esperado(): void
    {
        $this->assertSame('nsalas@tenri.cl', PermissionGuard::SUPER_ADMIN_EMAIL);
    }
}
