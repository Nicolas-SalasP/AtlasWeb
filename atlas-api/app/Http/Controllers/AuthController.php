<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $data = $this->authService->login($request->email, $request->password);
        $user = auth()->user(); 

        if ($user) {
            $this->logAccess($request, $user->id, 'Inicio de Sesión Exitoso');
        } else {
            $userId = null;
            if (is_array($data) && isset($data['user']['id'])) {
                $userId = $data['user']['id'];
            } elseif (is_object($data) && isset($data->user->id)) {
                $userId = $data->user->id;
            }

            if ($userId) {
                $this->logAccess($request, $userId, 'Inicio de Sesión Exitoso');
            }
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
                    $city = $response['city'];       // Ej: Pudahuel
                    $region = $response['regionName']; // Ej: Santiago Metropolitan
                }
            } else {
                $city = 'Localhost (Stgo)';
                $region = 'Metropolitana';
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