<?php

namespace App\Http\Controllers\Api;

use App\Domain\Product\Services\CategoryService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Product\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicCategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->listAll();

        return response()->json(
            CategoryResource::collection($categories)->toArray($request)
        );
    }
}
