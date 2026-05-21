<?php

namespace App\Http\Controllers\Api;

use App\Domain\System\Services\UfService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class IndicadoresController extends Controller
{
    public function __construct(private readonly UfService $ufService)
    {
    }

    public function uf(): JsonResponse
    {
        return response()->json([
            'uf' => $this->ufService->valorHoy(),
        ]);
    }
}
