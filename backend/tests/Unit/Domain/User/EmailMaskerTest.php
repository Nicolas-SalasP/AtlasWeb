<?php

namespace Tests\Unit\Domain\User;

use App\Domain\User\Support\EmailMasker;
use PHPUnit\Framework\TestCase;

class EmailMaskerTest extends TestCase
{
    public function test_enmascara_email_estandar(): void
    {
        $this->assertSame('n*****s@tenri.cl', EmailMasker::mask('nicolas@tenri.cl'));
    }

    public function test_enmascara_email_corto(): void
    {
        $masked = EmailMasker::mask('ab@x.cl');

        $this->assertNotNull($masked);
        $this->assertStringStartsWith('a', $masked);
        $this->assertStringContainsString('@x.cl', $masked);
    }

    public function test_preserva_primera_y_ultima_letra(): void
    {
        $result = EmailMasker::mask('contacto@example.com');

        $this->assertStringStartsWith('c', $result);
        $this->assertStringContainsString('o@example.com', $result);
    }

    public function test_retorna_null_si_email_sin_arroba(): void
    {
        $this->assertNull(EmailMasker::mask('sinarroba.com'));
    }

    public function test_retorna_null_si_email_con_multiples_arrobas(): void
    {
        $this->assertNull(EmailMasker::mask('a@b@c.cl'));
    }

    public function test_retorna_null_si_parte_local_vacia(): void
    {
        $this->assertNull(EmailMasker::mask('@domain.cl'));
    }

    public function test_retorna_null_para_string_vacio(): void
    {
        $this->assertNull(EmailMasker::mask(''));
    }

    public function test_un_solo_caracter_local_recibe_al_menos_un_asterisco(): void
    {
        $result = EmailMasker::mask('a@x.cl');

        $this->assertNotNull($result);
        $this->assertStringContainsString('*', $result);
        $this->assertStringEndsWith('@x.cl', $result);
    }

    public function test_preserva_el_dominio_intacto(): void
    {
        $result = EmailMasker::mask('alguien@subdomain.example.co.cl');

        $this->assertStringEndsWith('@subdomain.example.co.cl', $result);
    }

    public function test_no_filtra_la_parte_local_completa(): void
    {
        $original = 'secretoss@tenri.cl';
        $masked = EmailMasker::mask($original);

        $this->assertNotSame($original, $masked);
        $this->assertStringNotContainsString('secretoss', $masked);
    }

    public function test_largo_enmascarado_coincide_con_largo_original(): void
    {
        $masked = EmailMasker::mask('nicolas@tenri.cl');
        $local = explode('@', $masked)[0];

        $this->assertSame(strlen('nicolas'), strlen($local));
    }

    public function test_funciona_con_alias_de_email_con_signo_mas(): void
    {
        $result = EmailMasker::mask('user+filter@gmail.com');

        $this->assertNotNull($result);
        $this->assertStringEndsWith('@gmail.com', $result);
    }
}
