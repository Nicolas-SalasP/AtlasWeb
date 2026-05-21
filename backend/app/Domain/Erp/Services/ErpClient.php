<?php

namespace App\Domain\Erp\Services;

use App\Domain\Erp\DTOs\ProvisionErpUserData;
use App\Domain\Erp\Exceptions\ErpProvisioningException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ErpClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly ?string $apiKey,
        private readonly int $timeout = 8,
    ) {
    }

    public function provisionUser(ProvisionErpUserData $data): array
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new ErpProvisioningException('ERP_INTEGRATION_KEY no está configurada.');
        }

        try {
            $response = $this->request()
                ->post('/api/internal/web/provision-user', $data->toPayload());
        } catch (Throwable $e) {
            Log::error('ErpClient: error de red al provisionar usuario', [
                'error' => $e->getMessage(),
                'email' => $data->email,
            ]);
            throw new ErpProvisioningException('No se pudo contactar al ERP: ' . $e->getMessage());
        }

        if (!$response->successful()) {
            Log::warning('ErpClient: ERP rechazó la provisión', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'email'  => $data->email,
            ]);
            throw new ErpProvisioningException(
                'El ERP rechazó la provisión.',
                httpStatus: $response->status(),
                erpResponse: $response->body(),
            );
        }

        return $response->json() ?? [];
    }

    public function syncPassword(int $tenriUserId, string $passwordHash): void
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            return;
        }

        try {
            $this->request()->post('/api/internal/web/sync-password', [
                'tenri_user_id' => $tenriUserId,
                'password_hash' => $passwordHash,
            ]);
        } catch (Throwable $e) {
            Log::warning('ErpClient: error al sincronizar password', [
                'error'         => $e->getMessage(),
                'tenri_user_id' => $tenriUserId,
            ]);
        }
    }

    public function syncPlan(string $planSlug, array $moduleKeys): void
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            return;
        }

        try {
            $response = $this->request()->post('/api/internal/web/sync-plan', [
                'plan_slug'   => $planSlug,
                'module_keys' => $moduleKeys,
            ]);

            if (!$response->successful()) {
                Log::warning('ErpClient: ERP rechazó sync-plan', [
                    'status'    => $response->status(),
                    'plan_slug' => $planSlug,
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('ErpClient: error al sincronizar plan', [
                'error'     => $e->getMessage(),
                'plan_slug' => $planSlug,
            ]);
        }
    }

    public function onlineUsers(): array
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            return ['paid' => [], 'all' => []];
        }

        try {
            $response = $this->request()->get('/api/internal/web/online-users');

            if (!$response->successful()) {
                return ['paid' => [], 'all' => []];
            }

            return $response->json() ?? ['paid' => [], 'all' => []];
        } catch (Throwable $e) {
            Log::warning('ErpClient: error al obtener usuarios online', [
                'error' => $e->getMessage(),
            ]);
            return ['paid' => [], 'all' => []];
        }
    }

    private function request(): PendingRequest
    {
        return Http::withHeaders([
            'X-WEB-API-KEY' => $this->apiKey,
            'Accept'        => 'application/json',
        ])
            ->timeout($this->timeout)
            ->baseUrl($this->baseUrl);
    }
}
