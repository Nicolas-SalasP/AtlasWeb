<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyErpApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-ERP-API-KEY');
        $expected = env('ERP_INTEGRATION_KEY');

        if (!is_string($expected) || $expected === '' || $apiKey !== $expected) {
            return response()->json(['error' => 'No autorizado por Tenri Spa'], 401);
        }

        return $next($request);
    }
}
