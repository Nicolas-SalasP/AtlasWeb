<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Models\AccessLog;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderClaimOtp;
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

        $token = $user->createToken('auth_token')->plainTextToken;
        $this->logAccess($request, $user->id, 'Registro Exitoso');

        $requiresClaim = false;
        $maskedEmails = [];

        if (!empty($user->rut)) {
            $unlinkedOrders = Order::where('rut', $user->rut)->whereNull('user_id')->get();

            if ($unlinkedOrders->isNotEmpty()) {
                foreach ($unlinkedOrders as $order) {
                    $customerData = is_string($order->customer_data) ? json_decode($order->customer_data, true) : $order->customer_data;
                    if (is_string($customerData)) { $customerData = json_decode($customerData, true); }
                    
                    $email = $customerData['email'] ?? null;
                    
                    if ($email) {
                        $parts = explode('@', $email);
                        if (count($parts) === 2) {
                            $name = $parts[0];
                            $domain = $parts[1];
                            $maskedName = substr($name, 0, 1) . str_repeat('*', max(strlen($name) - 2, 1)) . substr($name, -1);
                            $maskedEmails[] = $maskedName . '@' . $domain;
                        }
                    }
                }
                
                if (count($maskedEmails) > 0) {
                    $requiresClaim = true;
                }
            }
        }

        return response()->json([
            'message' => 'Cuenta creada exitosamente',
            'data' => [
                'user' => $user,
                'token' => $token,
                'role' => 'cliente',
                'requires_order_claim' => $requiresClaim,
                'claimable_emails' => array_values(array_unique($maskedEmails))
            ]
        ], 201);
    }

    public function requestOrderClaimOtp(Request $request)
    {
        $request->validate(['historical_email' => 'required|email']);
        $user = $request->user();

        $hasOrders = Order::where('rut', $user->rut)->whereNull('user_id')->get()->contains(function ($order) use ($request) {
            $data = is_string($order->customer_data) ? json_decode($order->customer_data, true) : $order->customer_data;
            if (is_string($data)) { $data = json_decode($data, true); }
            return ($data['email'] ?? '') === $request->historical_email;
        });

        if (!$hasOrders) {
            return response()->json(['message' => 'Si hay órdenes asociadas, hemos enviado un código.'], 200);
        }

        $otp = rand(100000, 999999);
        $cacheKey = 'order_claim_otp_' . $user->id . '_' . $request->historical_email;
        Cache::put($cacheKey, $otp, now()->addMinutes(15));
        
        Mail::to($request->historical_email)->send(new OrderClaimOtp($otp));

        return response()->json(['message' => 'Si hay órdenes asociadas, hemos enviado un código.'], 200);
    }

    public function confirmOrderClaim(Request $request)
    {
        $request->validate([
            'historical_email' => 'required|email',
            'otp' => 'required|numeric|digits:6',
        ]);

        $user = $request->user();
        $cacheKey = 'order_claim_otp_' . $user->id . '_' . $request->historical_email;
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'El código es incorrecto o ha expirado.'], 400);
        }

        $ordersToUpdate = Order::where('rut', $user->rut)->whereNull('user_id')->get()->filter(function ($order) use ($request) {
            $data = $order->customer_data;
            if (is_string($data)) { $data = json_decode($data, true); }
            if (is_string($data)) { $data = json_decode($data, true); }
            return ($data['email'] ?? '') === $request->historical_email;
        });

        $updatedCount = 0;
        foreach ($ordersToUpdate as $order) {
            $order->update(['user_id' => $user->id]);
            $updatedCount++;
        }

        Cache::forget($cacheKey);

        return response()->json([
            'message' => "Se han vinculado $updatedCount órdenes a tu cuenta exitosamente.",
            'updated_orders' => $updatedCount
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $data = $this->authService->login($request->email, $request->password);
        $user = User::where('email', $request->email)->first(); 

        $requiresClaim = false;
        $maskedEmails = [];

        if ($user) {
            $this->logAccess($request, $user->id, 'Inicio de Sesión Exitoso');

            if (!empty($user->rut)) {
                $unlinkedOrders = Order::where('rut', $user->rut)->whereNull('user_id')->get();

                if ($unlinkedOrders->isNotEmpty()) {
                    foreach ($unlinkedOrders as $order) {
                        $customerData = is_string($order->customer_data) ? json_decode($order->customer_data, true) : $order->customer_data;
                        if (is_string($customerData)) { $customerData = json_decode($customerData, true); }
                        
                        $email = $customerData['email'] ?? null;
                        
                        if ($email) {
                            $parts = explode('@', $email);
                            if (count($parts) === 2) {
                                $name = $parts[0];
                                $domain = $parts[1];
                                $maskedName = substr($name, 0, 1) . str_repeat('*', max(strlen($name) - 2, 1)) . substr($name, -1);
                                $maskedEmails[] = $maskedName . '@' . $domain;
                            }
                        }
                    }
                    
                    if (count($maskedEmails) > 0) {
                        $requiresClaim = true;
                    }
                }
            }
        }

        if (is_array($data)) {
            $data['requires_order_claim'] = $requiresClaim;
            $data['claimable_emails'] = array_values(array_unique($maskedEmails));
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

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::broker()->sendResetLink(
            $request->only('email')
        );

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $this->logAccess($request, $user->id, 'Solicitud Recuperación de Contraseña');
        }

        return response()->json([
            'message' => 'Si el correo está en nuestra base de datos, recibirás un enlace de recuperación pronto.'
        ]);
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