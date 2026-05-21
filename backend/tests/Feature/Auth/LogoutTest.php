<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_no_autenticado_no_puede_hacer_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }
}
