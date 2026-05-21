<?php

namespace App\Http\Controllers\Api;

use App\Domain\System\Services\SettingService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SystemStatusController extends Controller
{
    public function __construct(private readonly SettingService $settingService)
    {
    }

    public function publicStatus(): JsonResponse
    {
        return response()->json([
            'maintenance_mode' => $this->settingService->maintenanceModeCached(),
        ]);
    }
}
