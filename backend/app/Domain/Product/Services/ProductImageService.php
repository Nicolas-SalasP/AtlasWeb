<?php

namespace App\Domain\Product\Services;

use App\Domain\Product\Exceptions\ImageUploadException;
use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductImageService
{
    public function uploadForProduct(Product $product, array $files): array
    {
        $created = [];
        $storedPaths = [];

        try {
            $hasExistingCover = $product->images()->where('is_cover', true)->exists();
            $nextPosition = (int) $product->images()->max('position') + 1;

            foreach ($files as $index => $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('products', $filename, 'public');

                if ($path === false) {
                    throw new ImageUploadException("No se pudo almacenar el archivo {$file->getClientOriginalName()}");
                }

                $storedPaths[] = $path;

                $image = ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => '/storage/' . $path,
                    'is_cover'   => !$hasExistingCover && $index === 0,
                    'position'   => $nextPosition + $index,
                ]);

                if (!$hasExistingCover && $index === 0) {
                    $hasExistingCover = true;
                }

                $created[] = $image;
            }
        } catch (Throwable $e) {
            foreach ($storedPaths as $path) {
                Storage::disk('public')->delete($path);
            }

            if ($e instanceof ImageUploadException) {
                throw $e;
            }

            throw new ImageUploadException($e->getMessage(), $e);
        }

        return $created;
    }

    public function destroy(int $imageId): void
    {
        $image = ProductImage::find($imageId);

        if (!$image) {
            return;
        }

        DB::transaction(function () use ($image) {
            $wasCover = (bool) $image->is_cover;
            $productId = (int) $image->product_id;

            $this->deletePhysicalFile($image->url);
            $image->delete();

            if ($wasCover) {
                $next = ProductImage::where('product_id', $productId)
                    ->orderBy('position')
                    ->first();

                if ($next) {
                    $next->update(['is_cover' => true]);
                }
            }
        });
    }

    public function setCover(int $imageId): ProductImage
    {
        return DB::transaction(function () use ($imageId) {
            $image = ProductImage::lockForUpdate()->find($imageId);

            if (!$image) {
                throw new ImageUploadException("Imagen {$imageId} no encontrada");
            }

            ProductImage::where('product_id', $image->product_id)
                ->where('id', '!=', $image->id)
                ->update(['is_cover' => false]);

            $image->update(['is_cover' => true]);

            return $image->fresh();
        });
    }

    public function deleteAllPhysicalFor(Product $product): void
    {
        foreach ($product->images as $image) {
            $this->deletePhysicalFile($image->url);
        }
    }

    private function deletePhysicalFile(?string $url): void
    {
        if (!$url) {
            return;
        }

        $relative = str_replace('/storage/', '', $url);

        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
