<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Catalog\DTOs\CreateServiceData;
use App\Domain\Catalog\DTOs\UpdateServiceData;
use App\Domain\Catalog\Exceptions\OfferingNotFoundException;
use App\Domain\Catalog\Exceptions\ServiceImageUploadException;
use App\Domain\Catalog\Services\CatalogService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\Catalog\ServiceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminServiceController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $services = $this->catalogService->listAll();

        return response()->json(
            ServiceResource::collection($services)->toArray($request)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $service = $this->catalogService->findById($id);
        } catch (OfferingNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json(
            (new ServiceResource($service))->toArray($request)
        );
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $image = $request->file('image');
        $data = CreateServiceData::fromValidated($request->validated(), $image);

        try {
            $service = $this->catalogService->create($data);
        } catch (ServiceImageUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error creando servicio: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo crear el servicio'], 500);
        }

        return response()->json(
            (new ServiceResource($service))->toArray($request),
            201
        );
    }

    public function update(UpdateServiceRequest $request, int $id): JsonResponse
    {
        $image = $request->file('image');
        $validated = $request->validated();
        unset($validated['_method']);

        $data = UpdateServiceData::fromValidated($validated, $image);

        try {
            $service = $this->catalogService->update($id, $data);
        } catch (OfferingNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (ServiceImageUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando servicio {$id}: " . $e->getMessage());

            return response()->json(['message' => 'No se pudo actualizar el servicio'], 500);
        }

        return response()->json(
            (new ServiceResource($service))->toArray($request)
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->catalogService->delete($id);
        } catch (OfferingNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (Throwable $e) {
            Log::error("Error eliminando servicio {$id}: " . $e->getMessage());

            return response()->json(['message' => 'No se pudo eliminar el servicio'], 500);
        }

        return response()->json(['message' => 'Servicio eliminado']);
    }
}
