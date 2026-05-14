<?php

namespace App\Http\Resources\Product;

use App\Domain\Product\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Category $category */
        $category = $this->resource;

        return [
            'id'        => $category->id,
            'name'      => $category->name,
            'slug'      => $category->slug,
            'parent_id' => $category->parent_id,
            'is_active' => (bool) $category->is_active,
        ];
    }
}
