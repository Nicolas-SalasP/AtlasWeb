<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\DTOs\RegisterUserData;
use PHPUnit\Framework\TestCase;

class RegisterUserDataTest extends TestCase
{
    public function test_constructor_asigna_propiedades(): void
    {
        $dto = new RegisterUserData('Juan', 'a@b.cl', '12345678-5', 'secret', '127.0.0.1');

        $this->assertSame('Juan', $dto->name);
        $this->assertSame('a@b.cl', $dto->email);
        $this->assertSame('12345678-5', $dto->rut);
        $this->assertSame('secret', $dto->password);
        $this->assertSame('127.0.0.1', $dto->clientIp);
    }

    public function test_from_validated_normaliza_email_a_minusculas_y_recorta(): void
    {
        $dto = RegisterUserData::fromValidated([
            'name'     => 'X',
            'email'    => '  TEST@MAIL.COM  ',
            'rut'      => '11111111-1',
            'password' => 'x',
        ], '127.0.0.1');

        $this->assertSame('test@mail.com', $dto->email);
    }

    public function test_from_validated_recorta_espacios_del_nombre_y_rut(): void
    {
        $dto = RegisterUserData::fromValidated([
            'name'     => '  Nicolas  ',
            'email'    => 'a@b.cl',
            'rut'      => '  12345678-5  ',
            'password' => 'x',
        ], '127.0.0.1');

        $this->assertSame('Nicolas', $dto->name);
        $this->assertSame('12345678-5', $dto->rut);
    }

    public function test_from_validated_preserva_password_intacto_con_espacios(): void
    {
        $dto = RegisterUserData::fromValidated([
            'name'     => 'X',
            'email'    => 'a@b.cl',
            'rut'      => '11111111-1',
            'password' => '  Pass With Spaces  ',
        ], '127.0.0.1');

        $this->assertSame('  Pass With Spaces  ', $dto->password);
    }

    public function test_client_ip_se_almacena_tal_cual_se_pasa(): void
    {
        $dto = RegisterUserData::fromValidated([
            'name'     => 'X',
            'email'    => 'a@b.cl',
            'rut'      => '11111111-1',
            'password' => 'x',
        ], '203.0.113.42');

        $this->assertSame('203.0.113.42', $dto->clientIp);
    }

    public function test_dto_es_readonly(): void
    {
        $dto = RegisterUserData::fromValidated([
            'name'     => 'X',
            'email'    => 'a@b.cl',
            'rut'      => '11111111-1',
            'password' => 'x',
        ], '127.0.0.1');

        $this->expectException(\Error::class);

        $dto->email = 'hijack@evil.cl';
    }
}
