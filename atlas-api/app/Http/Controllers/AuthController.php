<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Models\AccessLog;
use App\Models\User;   // <--- Agregado
use App\Models\Order;  // <--- Agregado para vincular compras
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash; // <--- Agregado para encriptar password

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'rut' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Ingresa un correo válido.',
            'email.unique' => 'Este correo ya está registrado.',
            'rut.required' => 'El RUT es obligatorio.',
            'rut.unique' => 'Este RUT ya está registrado en el sistema.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'rut' => $validatedData['rut'],
            'password' => Hash::make($validatedData['password']),
            'role_id' => 2,
            'is_active' => true
        ]);
        if (!empty($user->rut)) {
            Order::where('rut', $user->rut)
                ->whereNull('user_id')
                ->update(['user_id' => $user->id]);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        $this->logAccess($request, $user->id, 'Registro de Nuevo Usuario');

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $data = $this->authService->login($request->email, $request->password);
        $userId = null;
        if (is_array($data) && isset($data['user']['id'])) {
            $userId = $data['user']['id'];
        } elseif (is_object($data) && isset($data->user->id)) {
            $userId = $data->user->id;
        }

        if ($userId) {
            $this->logAccess($request, $userId, 'Inicio de Sesión Exitoso');
        }

        return response()->json([
            'message' => 'Login exitoso',
            'data' => $data
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $this->logAccess($request, $user->id, 'Cierre de Sesión');
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('role'));
    }

    private function logAccess(Request $request, $userId, $action)
    {
        try {
            $ip = $request->ip();
            $city = null;
            $region = null;
            if ($ip !== '127.0.0.1' && $ip !== '::1') {
                $response = Http::timeout(2)->get("http://ip-api.com/json/{$ip}?fields=status,city,regionName");

                if ($response->successful() && $response['status'] === 'success') {
                    $city = $response['city'];
                    $region = $response['regionName'];
                }
            } else {
                $city = 'Localhost';
                $region = 'Dev';
            }

            AccessLog::create([
                'user_id' => $userId,
                'ip_address' => $ip,
                'city' => $city,
                'region' => $region,
                'action' => $action,
                'user_agent' => $request->header('User-Agent'),
            ]);

        } catch (\Exception $e) {
            \Log::error("Error guardando AccessLog: " . $e->getMessage());
        }
    }
}