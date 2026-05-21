<?php

namespace App\Domain\Erp\Services;

use App\Domain\Catalog\Models\Service;
use App\Domain\Erp\DTOs\ProvisionErpUserData;
use App\Domain\Erp\Exceptions\ErpProvisioningException;
use App\Domain\Order\Models\Order;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\Log;

class ErpProvisioningService
{
    public function __construct(
        private readonly ErpClient $client,
    ) {
    }

    public function provisionFromPaidOrder(Order $order): array
    {
        $order->loadMissing(['items', 'user']);

        if (!$order->user instanceof User) {
            Log::info('ErpProvisioning: orden sin user asociado, se omite.', [
                'order_id' => $order->id,
            ]);
            return [];
        }

        $serviceIds = $order->items
            ->pluck('service_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        if ($serviceIds === []) {
            return [];
        }

        $erpServices = Service::whereIn('id', $serviceIds)
            ->where('slug', 'like', 'erp-%')
            ->get();

        if ($erpServices->isEmpty()) {
            return [];
        }

        $resultados = [];

        foreach ($erpServices as $service) {
            try {
                $data = ProvisionErpUserData::fromUserAndService($order->user, $service);
                $resultados[] = $this->client->provisionUser($data);

                Log::info('ErpProvisioning: usuario provisionado en ERP', [
                    'order_id' => $order->id,
                    'tenri_user_id' => $order->user->id,
                    'plan_slug' => $service->slug,
                ]);
            } catch (ErpProvisioningException $e) {
                Log::error('ErpProvisioning: fallo al provisionar', [
                    'order_id' => $order->id,
                    'plan_slug' => $service->slug,
                    'error' => $e->getMessage(),
                    'http' => $e->httpStatus,
                ]);
            }
        }

        return $resultados;
    }
}
