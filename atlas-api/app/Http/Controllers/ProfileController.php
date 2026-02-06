<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use App\Models\AccessLog;
use Log;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json(['message' => 'Perfil actualizado correctamente', 'user' => $user]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function requestEmailChange(Request $request)
    {
        $request->validate(['new_email' => 'required|email|unique:users,email']);
        
        $user = $request->user();
        $code = rand(100000, 999999);
        Cache::put('email_change_' . $user->id, [
            'email' => $request->new_email,
            'code' => $code
        ], 600);

        Log::info("Código de verificación para cambio de correo ({$request->new_email}): {$code}");
        // Mail::to($request->new_email)->send(new EmailChangeVerification($code));

        return response()->json([
            'message' => 'Hemos enviado un código de verificación a tu nuevo correo.',
            'debug_code' => $code
        ]);
    }

    public function verifyEmailChange(Request $request)
    {
        $request->validate(['code' => 'required|numeric']);
        
        $user = $request->user();
        $cacheKey = 'email_change_' . $user->id;
        $cachedData = Cache::get($cacheKey);

        if (!$cachedData || $cachedData['code'] != $request->code) {
            return response()->json(['message' => 'El código es inválido o ha expirado.'], 400);
        }

        $user->update(['email' => $cachedData['email']]);
        Cache::forget($cacheKey);

        return response()->json(['message' => 'Correo actualizado exitosamente.', 'user' => $user]);
    }

    public function getOrders(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product.images']) 
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function getSubscription(Request $request)
    {
        $user = $request->user();
        $isActive = $user->role_id === 1 || ($user->subscription_ends_at && $user->subscription_ends_at > now());

        return response()->json([
            'status' => $isActive ? 'active' : 'inactive',
            'plan_name' => 'Plan ERP Profesional',
            'next_billing_date' => $isActive ? now()->addDays(15)->format('Y-m-d') : null,
            'amount' => 25000,
            'features' => [
                'Acceso total al ERP',
                'Facturación Ilimitada',
                'Soporte Prioritario'
            ]
        ]);
    }

    public function getTicketsSummary(Request $request)
    {
        $user = $request->user();
        $tickets = \App\Models\Ticket::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $stats = [
            'total' => \App\Models\Ticket::where('user_id', $user->id)->count(),
            'open' => \App\Models\Ticket::where('user_id', $user->id)->whereIn('status', ['open', 'in_progress'])->count(),
            'closed' => \App\Models\Ticket::where('user_id', $user->id)->where('status', 'closed')->count(),
        ];

        return response()->json([
            'tickets' => $tickets,
            'stats' => $stats
        ]);
    }

    public function getSecurityLogs(Request $request)
    {
        $logs = AccessLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($log) {
                $location = 'Ubicación desconocida';
                if ($log->city) {
                    $location = $log->city . ($log->region ? ", {$log->region}" : '');
                }

                return [
                    'id' => $log->id,
                    'ip' => $log->ip_address,
                    'location' => $location,
                    'action' => $log->action,
                    'device' => 'Navegador Web', 
                    'date' => $log->created_at->diffForHumans(),
                    'exact_date' => $log->created_at->format('d/m/Y H:i'),
                ];
            });

        return response()->json($logs);
    }
}