<?php

namespace App\Http\Resources\Product;

use App\Domain\Product\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Product $product */
        $product = $this->resource;

        return [
            'id'            => $product->id,
            'sku'           => $product->sku,
            'name'          => $product->name,
            'slug'          => $product->slug,
            'description'   => $product->description,
            'price'         => (int) $product->price,
            'cost_price'    => $product->cost_price !== null ? (int) $product->cost_price : null,
            'stock_current' => (int) $product->stock_current,
            'stock_alert'   => (int) $product->stock_alert,
            'low_stock'     => (int) $product->stock_current <= (int) $product->stock_alert,
            'is_visible'    => (bool) $product->is_visible,
            'specs'         => $product->specs,
            'cover'         => $product->cover ?? null,
            'category_id'   => $product->category_id,
            'category'      => $this->whenLoaded('category', fn () => $product->category ? [
                'id'   => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null),
            'images'     => ProductImageResource::collection($this->whenLoaded('images')),
            'created_at' => $product->created_at?->toIso8601String(),
            'updated_at' => $product->updated_at?->toIso8601String(),
        ];
    }
}
