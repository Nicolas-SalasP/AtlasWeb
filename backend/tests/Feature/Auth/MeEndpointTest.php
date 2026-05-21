<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_autenticado_no_puede_acceder_a_me(): void
    {
        $response = $this->getJson('/api/me');

        $this->assertContains($response->getStatusCode(), [401, 403, 404]);
    }

    public function test_usuario_autenticado_accede_a_su_perfil(): void
    {
        $user = $this->actingAsUser(['name' => 'Specific Name', 'email' => 'me@x.cl']);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJsonFragment(['email' => 'me@x.cl']);
    }

    public function test_endpoint_profile_no_filtra_password(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $body = json_encode($response->json());
        $this->assertStringNotContainsString('$2y$', $body, 'Hash de bcrypt filtrado en respuesta de profile');
    }

    public function test_endpoint_profile_no_filtra_remember_token(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $body = strtolower(json_encode($response->json()));
        $this->assertStringNotContainsString('remember_token', $body);
    }

    public function test_no_autenticado_no_puede_acceder_a_profile(): void
    {
        $response = $this->getJson('/api/profile');

        $this->assertContains($response->getStatusCode(), [401, 403]);
    }
}
