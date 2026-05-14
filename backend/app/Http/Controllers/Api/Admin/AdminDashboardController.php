<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\System\Services\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->dashboardService->summary());
    }

    public function notifications(Request $request): JsonResponse
    {
        return response()->json($this->dashboardService->notifications());
    }
}
