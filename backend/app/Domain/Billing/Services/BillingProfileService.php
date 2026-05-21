<?php

namespace App\Domain\Billing\Services;

use App\Domain\Billing\DTOs\CreateBillingProfileData;
use App\Domain\Billing\DTOs\UpdateBillingProfileData;
use App\Domain\Billing\Exceptions\BillingProfileNotFoundException;
use App\Domain\Billing\Exceptions\InvalidRutException;
use App\Domain\Billing\Models\BillingProfile;
use App\Domain\Billing\Support\RutValidator;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BillingProfileService
{
    public function listForUser(User $user): Collection
    {
        return $user->billingProfiles()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();
    }

    public function findForUser(User $user, int $profileId): BillingProfile
    {
        $profile = $user->billingProfiles()->find($profileId);

        if (!$profile) {
            throw new BillingProfileNotFoundException($profileId);
        }

        return $profile;
    }

    public function createForUser(User $user, CreateBillingProfileData $data): BillingProfile
    {
        $this->assertValidRut($data->rut);
        $normalizedRut = RutValidator::normalize($data->rut);

        return DB::transaction(function () use ($user, $data, $normalizedRut) {
            $isFirst = $user->billingProfiles()->count() === 0;
            $shouldBeDefault = $isFirst || $data->isDefault;

            if ($shouldBeDefault) {
                $user->billingProfiles()->update(['is_default' => false]);
            }

            return $user->billingProfiles()->create([
                'rut'           => $normalizedRut,
                'business_name' => $data->businessName,
                'business_line' => $data->businessLine,
                'address'       => $data->address,
                'city'          => $data->city,
                'email_dte'     => $data->emailDte,
                'is_default'    => $shouldBeDefault,
            ]);
        });
    }

    public function updateForUser(User $user, int $profileId, UpdateBillingProfileData $data): BillingProfile
    {
        return DB::transaction(function () use ($user, $profileId, $data) {
            $profile = $user->billingProfiles()->lockForUpdate()->find($profileId);

            if (!$profile) {
                throw new BillingProfileNotFoundException($profileId);
            }

            if ($data->rut !== null) {
                $this->assertValidRut($data->rut);
                $profile->rut = RutValidator::normalize($data->rut);
            }

            if ($data->businessName !== null) {
                $profile->business_name = $data->businessName;
            }
            if ($data->businessLine !== null) {
                $profile->business_line = $data->businessLine;
            }
            if ($data->address !== null) {
                $profile->address = $data->address;
            }
            if ($data->cityProvided) {
                $profile->city = $data->city;
            }
            if ($data->emailDteProvided) {
                $profile->email_dte = $data->emailDte;
            }

            if ($data->isDefault === true && !$profile->is_default) {
                $user->billingProfiles()
                    ->where('id', '!=', $profile->id)
                    ->update(['is_default' => false]);
                $profile->is_default = true;
            }

            $profile->save();

            return $profile->fresh();
        });
    }

    public function deleteForUser(User $user, int $profileId): void
    {
        DB::transaction(function () use ($user, $profileId) {
            $profile = $user->billingProfiles()->lockForUpdate()->find($profileId);

            if (!$profile) {
                throw new BillingProfileNotFoundException($profileId);
            }

            $wasDefault = (bool) $profile->is_default;
            $profile->delete();

            if ($wasDefault) {
                $replacement = $user->billingProfiles()
                    ->orderByDesc('created_at')
                    ->first();

                if ($replacement) {
                    $replacement->update(['is_default' => true]);
                }
            }
        });
    }

    private function assertValidRut(string $rut): void
    {
        if (!RutValidator::isValid($rut)) {
            throw new InvalidRutException($rut);
        }
    }
}
