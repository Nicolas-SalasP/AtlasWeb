<?php

namespace App\Domain\Product\Services;

use App\Domain\Product\Exceptions\CategoryNotFoundException;
use App\Domain\Product\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function findById(int $id): Category
    {
        $category = Category::find($id);

        if (!$category) {
            throw new CategoryNotFoundException($id);
        }

        return $category;
    }

    public function listAll(): Collection
    {
        return Category::orderBy('name')->get();
    }

    public function listActive(): Collection
    {
        return Category::where('is_active', true)->orderBy('name')->get();
    }

    public function assertExists(int $id): void
    {
        if (!Category::where('id', $id)->exists()) {
            throw new CategoryNotFoundException($id);
        }
    }
}
