<?php

namespace App\Domain\User\Services;

use App\Domain\User\DTOs\ChangePasswordData;
use App\Domain\User\DTOs\UpdateProfileData;
use App\Domain\User\Exceptions\EmailAlreadyTakenException;
use App\Domain\User\Exceptions\IncorrectPasswordException;
use App\Domain\User\Exceptions\InvalidOtpException;
use App\Domain\User\Models\User;
use App\Mail\EmailChangeVerification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ProfileService
{
    private const EMAIL_CHANGE_CACHE_PREFIX = 'email_change_';
    private const EMAIL_CHANGE_TTL_SECONDS = 600;

    public function updateProfile(User $user, UpdateProfileData $data): User
    {
        $user->name = $data->name;

        if ($data->phoneProvided) {
            $user->phone = $data->phone;
        }

        $user->save();

        return $user->fresh();
    }

    public function changePassword(User $user, ChangePasswordData $data): void
    {
        if (!Hash::check($data->currentPassword, $user->password)) {
            throw new IncorrectPasswordException();
        }

        $user->update(['password' => Hash::make($data->newPassword)]);
    }

    public function requestEmailChange(User $user, string $newEmail): void
    {
        $newEmail = strtolower(trim($newEmail));

        if (User::where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
            throw new EmailAlreadyTakenException($newEmail);
        }

        $code = random_int(100000, 999999);

        Cache::put(
            self::EMAIL_CHANGE_CACHE_PREFIX . $user->id,
            ['email' => $newEmail, 'code' => $code],
            self::EMAIL_CHANGE_TTL_SECONDS
        );

        Mail::to($newEmail)->send(new EmailChangeVerification($code));
    }

    public function verifyEmailChange(User $user, int $code): User
    {
        $cacheKey = self::EMAIL_CHANGE_CACHE_PREFIX . $user->id;
        $cached = Cache::get($cacheKey);

        if (!is_array($cached) || (int) ($cached['code'] ?? 0) !== $code) {
            throw new InvalidOtpException();
        }

        $newEmail = (string) $cached['email'];

        if (User::where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
            Cache::forget($cacheKey);
            throw new EmailAlreadyTakenException($newEmail);
        }

        $user->update(['email' => $newEmail]);
        Cache::forget($cacheKey);

        return $user->fresh();
    }
}
