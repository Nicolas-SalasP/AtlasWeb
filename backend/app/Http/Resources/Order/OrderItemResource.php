<?php

namespace App\Http\Resources\Order;

use App\Domain\Order\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var OrderItem $item */
        $item = $this->resource;

        return [
            'id'           => $item->id,
            'product_id'   => $item->product_id,
            'service_id'   => $item->service_id,
            'product_name' => $item->product_name,
            'sku_snapshot' => $item->sku_snapshot,
            'quantity'     => (int) $item->quantity,
            'unit_price'   => (int) $item->unit_price,
            'total_line'   => (int) $item->total_line,
            'item_status'  => $item->item_status,
        ];
    }
}
