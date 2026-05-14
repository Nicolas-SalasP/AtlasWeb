<?php

namespace App\Domain\User\Services;

use App\Domain\User\DTOs\AddressData;
use App\Domain\User\Exceptions\AddressNotFoundException;
use App\Domain\User\Models\Address;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AddressService
{
    public function listForUser(User $user): Collection
    {
        return $user->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();
    }

    public function createForUser(User $user, AddressData $data): Address
    {
        return DB::transaction(function () use ($user, $data) {
            $isFirst = $user->addresses()->count() === 0;
            $shouldBeDefault = $isFirst || $data->isDefault;

            $address = $user->addresses()->create([
                'alias'      => $data->alias,
                'address'    => $data->address,
                'number'     => $data->number,
                'depto'      => $data->depto,
                'region'     => $data->region,
                'commune'    => $data->commune,
                'is_default' => $shouldBeDefault,
            ]);

            if ($shouldBeDefault && !$isFirst) {
                $user->addresses()
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            return $address;
        });
    }

    public function deleteForUser(User $user, int $addressId): void
    {
        $address = $user->addresses()->find($addressId);

        if (!$address) {
            throw new AddressNotFoundException($addressId);
        }

        DB::transaction(function () use ($user, $address) {
            $wasDefault = (bool) $address->is_default;
            $address->delete();

            if ($wasDefault) {
                $replacement = $user->addresses()->orderByDesc('created_at')->first();
                if ($replacement) {
                    $replacement->update(['is_default' => true]);
                }
            }
        });
    }

    public function setDefaultForUser(User $user, int $addressId): Address
    {
        return DB::transaction(function () use ($user, $addressId) {
            $address = $user->addresses()->find($addressId);

            if (!$address) {
                throw new AddressNotFoundException($addressId);
            }

            $user->addresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);

            return $address->fresh();
        });
    }
}
