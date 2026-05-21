<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\System\Exceptions\InvalidSettingValueException;
use App\Domain\System\Services\SettingService;
use App\Http\Controllers\Controller;
use App\Http\Requests\System\UpdateSettingsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminSettingController extends Controller
{
    public function __construct(private readonly SettingService $settingService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->settingService->allRaw());
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        try {
            $this->settingService->updateMany($request->validated());
        } catch (InvalidSettingValueException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error actualizando configuración: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo guardar la configuración'], 500);
        }

        return response()->json(['message' => 'Configuración guardada de manera segura']);
    }
}
