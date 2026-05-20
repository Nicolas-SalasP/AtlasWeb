<?php

namespace App\Domain\Erp\Services;

use App\Domain\Erp\Exceptions\ErpProvisioningException;
use Illuminate\Support\Facades\Log;
use Throwable;

class ErpPasswordSyncService
{
    public function __construct(
        private readonly ErpClient $client,
    ) {
    }

    public function sync(int $tenriUserId, string $passwordHash): void
    {
        try {
            $this->client->syncPassword($tenriUserId, $passwordHash);
        } catch (Throwable $e) {
            Log::warning('ErpPasswordSync: no se pudo sincronizar password al ERP', [
                'tenri_user_id' => $tenriUserId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
