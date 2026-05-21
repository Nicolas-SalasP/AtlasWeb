<?php

namespace App\Http\Controllers\Api;

use App\Domain\Billing\DTOs\CreateBillingProfileData;
use App\Domain\Billing\DTOs\UpdateBillingProfileData;
use App\Domain\Billing\Exceptions\BillingProfileNotFoundException;
use App\Domain\Billing\Exceptions\InvalidRutException;
use App\Domain\Billing\Services\BillingProfileService;
use App\Domain\User\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\StoreBillingProfileRequest;
use App\Http\Requests\Billing\UpdateBillingProfileRequest;
use App\Http\Resources\Billing\BillingProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class BillingProfileController extends Controller
{
    public function __construct(private readonly BillingProfileService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $profiles = $this->service->listForUser($user);

        return response()->json(
            BillingProfileResource::collection($profiles)->toArray($request)
        );
    }

    public function store(StoreBillingProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = CreateBillingProfileData::fromValidated($request->validated());

        try {
            $profile = $this->service->createForUser($user, $data);
        } catch (InvalidRutException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error creando perfil de facturación: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo crear el perfil de facturación'], 500);
        }

        return response()->json(
            (new BillingProfileResource($profile))->toArray($request),
            201
        );
    }

    public function update(UpdateBillingProfileRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = UpdateBillingProfileData::fromValidated($request->validated());

        try {
            $profile = $this->service->updateForUser($user, $id, $data);
        } catch (BillingProfileNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (InvalidRutException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando perfil de facturación {$id}: " . $e->getMessage());

            return response()->json(['message' => 'No se pudo actualizar el perfil de facturación'], 500);
        }

        return response()->json(
            (new BillingProfileResource($profile))->toArray($request)
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $this->service->deleteForUser($user, $id);
        } catch (BillingProfileNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (Throwable $e) {
            Log::error("Error eliminando perfil de facturación {$id}: " . $e->getMessage());

            return response()->json(['message' => 'No se pudo eliminar el perfil de facturación'], 500);
        }

        return response()->json(['message' => 'Perfil de facturación eliminado']);
    }
}
