<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenance = SystemSetting::where('key', 'maintenance_mode')->value('value');

        if ($isMaintenance == '1') {
            $rutasPermitidas = [
                'api/admin',
                'api/login',
                'api/logout',
                'api/settings',
                'api/sanctum/csrf-cookie' 
            ];

            foreach ($rutasPermitidas as $ruta) {
                if ($request->is($ruta . '*')) {
                    return $next($request);
                }
            }
            return response()->json([
                'message' => 'Sistema en mantenimiento total.',
                'maintenance' => true
            ], 503);
        }

        return $next($request);
    }
}