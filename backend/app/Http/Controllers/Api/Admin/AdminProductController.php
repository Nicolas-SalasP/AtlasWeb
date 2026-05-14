<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Product\DTOs\CreateProductData;
use App\Domain\Product\DTOs\UpdateProductData;
use App\Domain\Product\Exceptions\CategoryNotFoundException;
use App\Domain\Product\Exceptions\DuplicateSkuException;
use App\Domain\Product\Exceptions\ImageUploadException;
use App\Domain\Product\Exceptions\ProductNotFoundException;
use App\Domain\Product\Services\ProductImageService;
use App\Domain\Product\Services\ProductService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\Product\ProductImageResource;
use App\Http\Resources\Product\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly ProductImageService $imageService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 25);
        $perPage = max(1, min($perPage, 100));

        $filters = $request->only(['q', 'category_id', 'is_visible', 'low_stock']);

        $paginator = $this->productService->paginateAdmin($filters, $perPage);
        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($product) => (new ProductResource($product))->toArray($request))
        );

        return response()->json($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $product = $this->productService->findById($id);
        } catch (ProductNotFoundException) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json((new ProductResource($product))->toArray($request));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $files = $request->file('images') ?? [];
        $data = CreateProductData::fromValidated($request->validated(), $files);
        $actorId = $request->user()?->id;

        try {
            $product = $this->productService->create($data, $actorId);
        } catch (DuplicateSkuException | CategoryNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (ImageUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error('Error creando producto: ' . $e->getMessage());

            return response()->json(['message' => 'Error al crear el producto'], 500);
        }

        return response()->json((new ProductResource($product))->toArray($request), 201);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $files = $request->file('images') ?? [];
        $validated = $request->validated();
        unset($validated['_method']);

        $data = UpdateProductData::fromValidated($validated, $files);
        $actorId = $request->user()?->id;

        try {
            $product = $this->productService->update($id, $data, $actorId);
        } catch (ProductNotFoundException) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        } catch (DuplicateSkuException | CategoryNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (ImageUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando producto {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al actualizar el producto'], 500);
        }

        return response()->json((new ProductResource($product))->toArray($request));
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->productService->softDelete($id);
        } catch (ProductNotFoundException) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json(['message' => 'Producto eliminado correctamente']);
    }

    public function forceDestroy(int $id): JsonResponse
    {
        try {
            $this->productService->forceDelete($id);
        } catch (ProductNotFoundException) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        } catch (Throwable $e) {
            Log::error("Error eliminando permanentemente producto {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al eliminar el producto'], 500);
        }

        return response()->json(['message' => 'Producto y sus imágenes eliminados permanentemente']);
    }

    public function destroyImage(int $id): JsonResponse
    {
        $this->imageService->destroy($id);

        return response()->json(['message' => 'Imagen eliminada']);
    }

    public function setCover(Request $request, int $id): JsonResponse
    {
        try {
            $image = $this->imageService->setCover($id);
        } catch (ImageUploadException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json([
            'message' => 'Portada actualizada',
            'image'   => (new ProductImageResource($image))->toArray($request),
        ]);
    }
}
