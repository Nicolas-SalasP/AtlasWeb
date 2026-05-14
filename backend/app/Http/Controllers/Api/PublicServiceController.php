<?php

namespace App\Http\Controllers\Api;

use App\Domain\Catalog\Services\CatalogService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\ServiceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicServiceController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService)
    {
    }

    public function indexPublic(Request $request): JsonResponse
    {
        $services = $this->catalogService->listActive();

        return response()->json(
            ServiceResource::collection($services)->toArray($request)
        );
    }
}
