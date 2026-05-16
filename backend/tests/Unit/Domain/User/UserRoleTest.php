<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\Enums\UserRole;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_admin_tiene_id_uno(): void
    {
        $this->assertSame(1, UserRole::Admin->value);
    }

    public function test_cliente_tiene_id_dos(): void
    {
        $this->assertSame(2, UserRole::Cliente->value);
    }

    public function test_admin_tiene_etiqueta_administrador(): void
    {
        $this->assertSame('Administrador', UserRole::Admin->label());
    }

    public function test_cliente_tiene_etiqueta_cliente(): void
    {
        $this->assertSame('Cliente', UserRole::Cliente->label());
    }

    public function test_values_retorna_arreglo_de_enteros(): void
    {
        $values = UserRole::values();

        $this->assertIsArray($values);
        $this->assertContains(1, $values);
        $this->assertContains(2, $values);
        foreach ($values as $v) {
            $this->assertIsInt($v);
        }
    }

    public function test_puede_construirse_desde_entero(): void
    {
        $this->assertSame(UserRole::Admin, UserRole::from(1));
        $this->assertSame(UserRole::Cliente, UserRole::from(2));
    }

    public function test_try_from_retorna_null_para_id_invalido(): void
    {
        $this->assertNull(UserRole::tryFrom(99));
        $this->assertNull(UserRole::tryFrom(0));
        $this->assertNull(UserRole::tryFrom(-1));
    }

    public function test_solamente_existen_dos_roles(): void
    {
        $this->assertCount(2, UserRole::cases());
    }
}
