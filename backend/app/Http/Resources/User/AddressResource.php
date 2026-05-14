<?php

namespace App\Http\Resources\User;

use App\Domain\User\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Address $address */
        $address = $this->resource;

        return [
            'id'         => $address->id,
            'alias'      => $address->alias,
            'address'    => $address->address,
            'number'     => $address->number,
            'depto'      => $address->depto,
            'region'     => $address->region,
            'commune'    => $address->commune,
            'is_default' => (bool) $address->is_default,
            'created_at' => $address->created_at?->toIso8601String(),
        ];
    }
}
