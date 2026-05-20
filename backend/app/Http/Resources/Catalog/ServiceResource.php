<?php

namespace App\Http\Resources\Catalog;

use App\Domain\Catalog\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Service $service */
        $service = $this->resource;

        return [
            'id'            => $service->id,
            'name'          => $service->name,
            'description'   => $service->description,
            'price'         => (int) $service->price,
            'price_uf'      => $service->price_uf,
            'price_label'   => $service->price_label,
            'is_popular'    => (bool) ($service->is_popular ?? false),
            'duration_days' => (int) $service->duration_days,
            'features'      => $service->features ?? [],
            'is_active'     => (bool) $service->is_active,
            'image_url'     => $service->image_url,
            'created_at'    => $service->created_at?->toIso8601String(),
            'updated_at'    => $service->updated_at?->toIso8601String(),
        ];
    }
}
