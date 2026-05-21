<?php

namespace App\Http\Controllers\Api;

use App\Domain\Product\Exceptions\ProductNotFoundException;
use App\Domain\Product\Services\ProductService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Product\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->listVisible();

        return response()->json(
            ProductResource::collection($products)->toArray($request)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $product = $this->productService->findVisibleById($id);
        } catch (ProductNotFoundException) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json((new ProductResource($product))->toArray($request));
    }
}
