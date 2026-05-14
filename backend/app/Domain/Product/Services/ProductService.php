<?php

namespace App\Domain\Product\Services;

use App\Domain\Product\Exceptions\InsufficientStockException;
use App\Domain\Product\Exceptions\ProductNotFoundException;
use App\Models\Product;

class ProductService
{
    public function findById(int $id): Product
    {
        $product = Product::find($id);

        if (!$product) {
            throw new ProductNotFoundException($id);
        }

        return $product;
    }

    public function findForUpdate(int $id): Product
    {
        $product = Product::where('id', $id)->lockForUpdate()->first();

        if (!$product) {
            throw new ProductNotFoundException($id);
        }

        return $product;
    }

    public function reserveStock(int $productId, int $quantity): Product
    {
        $product = $this->findForUpdate($productId);

        if ($product->stock_current < $quantity) {
            throw new InsufficientStockException($product->name, (int) $product->stock_current, $quantity);
        }

        $product->decrement('stock_current', $quantity);

        return $product->fresh();
    }

    public function restoreStock(int $productId, int $quantity): Product
    {
        $product = $this->findForUpdate($productId);
        $product->increment('stock_current', $quantity);

        return $product->fresh();
    }
}
