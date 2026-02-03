<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $isMaintenance = \App\Models\SystemSetting::where('key', 'maintenance_mode')->value('value');

        if ($isMaintenance == '1' && !$request->is('api/admin*') && !$request->is('api/login')) {
            return response()->json([
                'message' => 'Estamos en mantenimiento. Volvemos pronto.'
            ], 503);
        }

        return $next($request);
    }
}
