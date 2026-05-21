<?php

namespace App\Http\Resources\Order;

use App\Domain\Order\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Order $order */
        $order = $this->resource;

        return [
            'id'                 => $order->id,
            'order_number'       => $order->order_number,
            'status'             => $order->status?->value,
            'status_label'       => $order->status?->label(),
            'subtotal'           => (int) $order->subtotal,
            'shipping_cost'      => (int) $order->shipping_cost,
            'total'              => (int) $order->total,
            'shipping_address'   => $order->shipping_address,
            'shipping_provider'  => $order->shipping_provider?->value,
            'tracking_number'    => $order->tracking_number,
            'tracking_url'       => $order->shipping_provider?->trackingUrl($order->tracking_number ?? ''),
            'customer_data'      => $order->customer_data,
            'notes'              => $order->notes,
            'payment_method'     => $order->payment_method,
            'transfer_reference' => $order->transfer_reference,
            'transfer_date'      => $order->transfer_date?->toIso8601String(),
            'created_at'         => $order->created_at?->toIso8601String(),
            'updated_at'         => $order->updated_at?->toIso8601String(),
            'user'               => $this->whenLoaded('user', fn () => $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ] : null),
            'items'              => $this->whenLoaded('items', fn () => OrderItemResource::collection($order->items)),
            'status_logs'        => $this->whenLoaded('statusLogs', fn () => OrderStatusLogResource::collection($order->statusLogs)),
        ];
    }
}
