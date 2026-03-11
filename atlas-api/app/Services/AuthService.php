<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'rut' => $data['rut'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role_id' => 2 
        ]);

        \App\Models\Order::whereNull('user_id')
            ->where('customer_data->rut', $data['rut'])
            ->update(['user_id' => $user->id]);

        $token = $user->createToken('web-app')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'role' => $user->role->name ?? 'cliente'
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }
        $user->tokens()->delete();
        $token = $user->createToken('web-app')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'role' => $user->role->name
        ];
    }
}