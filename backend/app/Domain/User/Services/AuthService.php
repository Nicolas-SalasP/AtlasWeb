<?php

namespace App\Domain\User\Services;

use App\Domain\User\DTOs\LoginCredentials;
use App\Domain\User\DTOs\RegisterUserData;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Exceptions\InvalidCredentialsException;
use App\Domain\User\Models\User;
use Illuminate\Auth\Events\PasswordReset as PasswordResetEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(RegisterUserData $data): User
    {
        return User::create([
            'name'              => $data->name,
            'email'             => $data->email,
            'rut'               => $data->rut,
            'password'          => Hash::make($data->password),
            'role_id'           => UserRole::Cliente->value,
            'is_active'         => true,
            'terms_accepted_at' => now(),
            'terms_accepted_ip' => $data->clientIp,
        ]);
    }

    public function attemptSpaLogin(LoginCredentials $credentials, Request $request): User
    {
        $ok = Auth::attempt([
            'email'    => $credentials->email,
            'password' => $credentials->password,
        ], $credentials->remember);

        if (!$ok) {
            throw new InvalidCredentialsException();
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if (!$user instanceof User) {
            throw new InvalidCredentialsException();
        }

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    public function sendPasswordResetLink(string $email): ?User
    {
        Password::broker()->sendResetLink(['email' => $email]);

        return User::where('email', $email)->first();
    }

    public function resetPassword(array $credentials): User
    {
        $status = Password::broker()->reset(
            $credentials,
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordResetEvent($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['El token de recuperación es inválido o ha expirado.'],
            ]);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();
        $user->tokens()->delete();

        return $user;
    }
}
