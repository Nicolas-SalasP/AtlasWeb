<?php

namespace App\Http\Resources\Order;

use App\Domain\Order\Models\OrderStatusLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var OrderStatusLog $log */
        $log = $this->resource;

        return [
            'id'                => $log->id,
            'from_status'       => $log->from_status?->value,
            'from_status_label' => $log->from_status?->label(),
            'to_status'         => $log->to_status?->value,
            'to_status_label'   => $log->to_status?->label(),
            'actor_name'        => $log->actor_name,
            'reason'            => $log->reason,
            'created_at'        => $log->created_at?->toIso8601String(),
            'user'              => $this->whenLoaded('user', fn () => $log->user ? [
                'id'   => $log->user->id,
                'name' => $log->user->name,
            ] : null),
        ];
    }
}
