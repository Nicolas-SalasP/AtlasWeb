<?php

namespace App\Http\Resources\Billing;

use App\Domain\Billing\Models\BillingProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillingProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var BillingProfile $profile */
        $profile = $this->resource;

        return [
            'id'            => $profile->id,
            'rut'           => $profile->rut,
            'business_name' => $profile->business_name,
            'business_line' => $profile->business_line,
            'address'       => $profile->address,
            'city'          => $profile->city,
            'email_dte'     => $profile->email_dte,
            'is_default'    => (bool) $profile->is_default,
            'created_at'    => $profile->created_at?->toIso8601String(),
            'updated_at'    => $profile->updated_at?->toIso8601String(),
        ];
    }
}
