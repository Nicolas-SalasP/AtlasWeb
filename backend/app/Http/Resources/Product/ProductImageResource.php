<?php

namespace App\Http\Resources\Product;

use App\Domain\Product\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var ProductImage $image */
        $image = $this->resource;

        return [
            'id'         => $image->id,
            'url'        => $image->url,
            'is_cover'   => (bool) $image->is_cover,
            'position'   => (int) $image->position,
            'product_id' => $image->product_id,
        ];
    }
}
