<?php

namespace App\Observers;

use App\Domain\Erp\Services\ErpProvisioningService;
use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderObserver
{
    public function __construct(
        private readonly ErpProvisioningService $provisioning,
    ) {
    }

    public function updated(Order $order): void
    {
        if (!$order->wasChanged('status')) {
            return;
        }

        if ($order->status !== OrderStatus::Paid) {
            return;
        }

        try {
            $this->provisioning->provisionFromPaidOrder($order);
        } catch (Throwable $e) {
            Log::error('OrderObserver: fallo inesperado al provisionar ERP', [
                'order_id' => $order->id,
                'error'    => $e->getMessage(),
            ]);
        }
    }
}
