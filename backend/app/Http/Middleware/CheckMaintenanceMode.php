<?php

namespace App\Http\Middleware;

use App\Domain\System\Services\SettingService;
use App\Domain\System\Support\MaintenanceWhitelist;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function __construct(private readonly SettingService $settingService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (!$this->settingService->maintenanceModeCached()) {
            return $next($request);
        }

        if (MaintenanceWhitelist::isAllowed($request->path())) {
            return $next($request);
        }

        return response()->json([
            'message'     => 'Sistema en mantenimiento total.',
            'maintenance' => true,
        ], 503);
    }
}
