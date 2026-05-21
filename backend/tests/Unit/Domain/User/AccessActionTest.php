<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\Enums\AccessAction;
use PHPUnit\Framework\TestCase;

class AccessActionTest extends TestCase
{
    public function test_etiqueta_de_registro_exitoso(): void
    {
        $this->assertSame('Registro Exitoso', AccessAction::RegisterSuccess->value);
    }

    public function test_etiqueta_de_inicio_de_sesion_exitoso(): void
    {
        $this->assertSame('Inicio de Sesión Exitoso', AccessAction::LoginSuccess->value);
    }

    public function test_etiqueta_de_intento_de_login_fallido(): void
    {
        $this->assertSame('Intento de Login Fallido', AccessAction::LoginFailure->value);
    }

    public function test_etiqueta_de_cierre_de_sesion(): void
    {
        $this->assertSame('Cierre de Sesión', AccessAction::Logout->value);
    }

    public function test_etiqueta_de_solicitud_de_recuperacion_de_password(): void
    {
        $this->assertSame('Solicitud Recuperación de Contraseña', AccessAction::PasswordResetRequested->value);
    }

    public function test_etiqueta_de_password_restablecida(): void
    {
        $this->assertSame('Contraseña Restablecida', AccessAction::PasswordReset->value);
    }

    public function test_etiqueta_de_password_cambiada(): void
    {
        $this->assertSame('Contraseña Cambiada', AccessAction::PasswordChanged->value);
    }

    public function test_etiqueta_de_solicitud_de_cambio_de_correo(): void
    {
        $this->assertSame('Solicitud de Cambio de Correo', AccessAction::EmailChangeRequested->value);
    }

    public function test_etiqueta_de_correo_cambiado(): void
    {
        $this->assertSame('Correo Cambiado', AccessAction::EmailChanged->value);
    }

    public function test_etiqueta_de_reclamacion_de_ordenes_confirmada(): void
    {
        $this->assertSame('Reclamación de Órdenes Confirmada', AccessAction::OrderClaimSuccess->value);
    }

    public function test_existen_exactamente_diez_acciones(): void
    {
        $this->assertCount(10, AccessAction::cases());
    }

    public function test_try_from_retorna_null_para_accion_invalida(): void
    {
        $this->assertNull(AccessAction::tryFrom('Login'));
        $this->assertNull(AccessAction::tryFrom(''));
        $this->assertNull(AccessAction::tryFrom('Inicio Sesion'));
    }
}
