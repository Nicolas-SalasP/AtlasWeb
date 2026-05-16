<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\DTOs\LoginCredentials;
use PHPUnit\Framework\TestCase;

class LoginCredentialsTest extends TestCase
{
    public function test_constructor_asigna_propiedades(): void
    {
        $dto = new LoginCredentials('a@b.cl', 'secret', true);

        $this->assertSame('a@b.cl', $dto->email);
        $this->assertSame('secret', $dto->password);
        $this->assertTrue($dto->remember);
    }

    public function test_from_validated_convierte_email_a_minusculas(): void
    {
        $dto = LoginCredentials::fromValidated([
            'email'    => 'NICOLAS@TENRI.CL',
            'password' => 'x',
        ]);

        $this->assertSame('nicolas@tenri.cl', $dto->email);
    }

    public function test_from_validated_recorta_espacios_del_email(): void
    {
        $dto = LoginCredentials::fromValidated([
            'email'    => '  user@x.cl  ',
            'password' => 'x',
        ]);

        $this->assertSame('user@x.cl', $dto->email);
    }

    public function test_remember_me_por_defecto_es_false_si_no_se_envia(): void
    {
        $dto = LoginCredentials::fromValidated([
            'email'    => 'a@b.cl',
            'password' => 'x',
        ]);

        $this->assertFalse($dto->remember);
    }

    public function test_remember_me_castea_valores_truthy_a_boolean(): void
    {
        $dto = LoginCredentials::fromValidated([
            'email'       => 'a@b.cl',
            'password'    => 'x',
            'remember_me' => 1,
        ]);

        $this->assertTrue($dto->remember);
    }

    public function test_dto_es_readonly(): void
    {
        $dto = LoginCredentials::fromValidated(['email' => 'a@b.cl', 'password' => 'x']);

        $this->expectException(\Error::class);

        $dto->email = 'hijack@evil.cl';
    }
}
