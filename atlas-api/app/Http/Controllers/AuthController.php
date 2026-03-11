<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Models\AccessLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'rut' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $data = $this->authService->register($request->only('name', 'email', 'rut', 'password'));

        $this->logAccess($request, $data['user']->id, 'Registro Exitoso');

        return response()->json([
            'message' => 'Cuenta creada exitosamente',
            'data' => $data
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $data = $this->authService->login($request->email, $request->password);
        $user = auth()->user(); 

        $userId = $user ? $user->id : ($data['user']['id'] ?? null);
        
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

    // --- MÉTODOS DE SEGURIDAD: RECUPERACIÓN DE CONTRASEÑA ---

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Si el correo existe en nuestra base de datos, enviaremos un enlace.' // Mensaje genérico para evitar filtración de usuarios
        ]);

        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                $this->logAccess($request, $user->id, 'Solicitud Recuperación de Contraseña');
            }

            return response()->json([
                'message' => 'Te hemos enviado un enlace para restablecer tu contraseña.'
            ]);
        }

        return response()->json([
            'message' => 'No se pudo enviar el enlace. Intenta nuevamente.'
        ], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            $user = User::where('email', $request->email)->first();
            $user->tokens()->delete();
            $this->logAccess($request, $user->id, 'Contraseña Restablecida');

            return response()->json([
                'message' => 'Tu contraseña ha sido restablecida exitosamente.'
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['El token de recuperación es inválido o ha expirado.']
        ]);
    }

    private function logAccess(Request $request, $userId, $action)
    {
        try {
            $ip = $request->ip();
            AccessLog::create([
                'user_id' => $userId,
                'ip_address' => $ip,
                'action' => $action,
            ]);
        } catch (\Exception $e) {
            \Log::error("Error guardando AccessLog: " . $e->getMessage());
        }
    }
}