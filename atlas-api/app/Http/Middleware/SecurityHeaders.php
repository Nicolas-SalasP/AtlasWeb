<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if (method_exists($response, 'headers')) {
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
            $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
            
            // CSP estricto para la API: No debería ejecutar scripts ni embeber nada, solo entregar datos.
            $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
        }

        return $response;
    }
}