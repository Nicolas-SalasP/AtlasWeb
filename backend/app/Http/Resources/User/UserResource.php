<?php

namespace App\Http\Resources\User;

use App\Domain\User\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var User $user */
        $user = $this->resource;

        return [
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'rut'                => $user->rut,
            'phone'              => $user->phone,
            'avatar'             => $user->avatar,
            'role_id'            => (int) $user->role_id,
            'is_active'          => (bool) $user->is_active,
            'permissions'        => $user->permissions,
            'company_name'       => $user->company_name ?? null,
            'tickets_count'      => $user->tickets_count ?? null,
            'terms_accepted_at'  => $user->terms_accepted_at?->toIso8601String(),
            'created_at'         => $user->created_at?->toIso8601String(),
            'updated_at'         => $user->updated_at?->toIso8601String(),
            'role'               => $this->whenLoaded('role', fn () => $user->role ? [
                'id'   => $user->role->id,
                'name' => $user->role->name,
            ] : null),
        ];
    }
}
