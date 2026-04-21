<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyErpApiKey
{
    public function handle(Request $request, Closure $next)
{
    $apiKey = $request->header('X-ERP-API-KEY');
    
    // Pruebas con POSTMAN
    // die(json_encode(["recibido" => $apiKey, "esperado" => env('ERP_INTEGRATION_KEY')]));

    if ($apiKey !== env('ERP_INTEGRATION_KEY')) {
        return response()->json(['error' => 'No autorizado por Tenri Spa'], 401);
    }
    return $next($request);
}
}