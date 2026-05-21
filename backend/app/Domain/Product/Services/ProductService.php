<?php

namespace App\Domain\Product\Services;

use App\Domain\Product\DTOs\CreateProductData;
use App\Domain\Product\DTOs\UpdateProductData;
use App\Domain\Product\Enums\StockMovementType;
use App\Domain\Product\Exceptions\DuplicateSkuException;
use App\Domain\Product\Exceptions\InsufficientStockException;
use App\Domain\Product\Exceptions\ProductNotFoundException;
use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        private readonly CategoryService $categoryService,
        private readonly ProductImageService $imageService,
    ) {
    }

    public function paginateAdmin(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = Product::with(['category', 'images'])
            ->orderByDesc('created_at');

        $this->applyAdminFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function listAdmin(array $filters = []): Collection
    {
        $query = Product::with(['category', 'images'])
            ->orderByDesc('created_at');

        $this->applyAdminFilters($query, $filters);

        return $query->get();
    }

    public function listVisible(): Collection
    {
        return Product::with(['images', 'category'])
            ->where('is_visible', true)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findById(int $id): Product
    {
        $product = Product::with(['category', 'images'])->find($id);

        if (!$product) {
            throw new ProductNotFoundException($id);
        }

        return $product;
    }

    public function findVisibleById(int $id): Product
    {
        $product = Product::with(['category', 'images'])
            ->where('id', $id)
            ->where('is_visible', true)
            ->first();

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

    public function create(CreateProductData $data, ?int $actorUserId = null): Product
    {
        return DB::transaction(function () use ($data, $actorUserId) {
            $this->categoryService->assertExists($data->categoryId);
            $this->assertSkuAvailable($data->sku);

            $product = Product::create([
                'sku'           => $data->sku,
                'name'          => $data->name,
                'slug'          => $this->generateUniqueSlug($data->name),
                'description'   => $data->description,
                'price'         => $data->price,
                'cost_price'    => $data->costPrice,
                'stock_current' => $data->stockCurrent,
                'stock_alert'   => $data->stockAlert,
                'category_id'   => $data->categoryId,
                'is_visible'    => $data->isVisible,
                'specs'         => $data->specs,
            ]);

            if ($data->stockCurrent > 0) {
                $this->logMovement(
                    product: $product,
                    type: StockMovementType::Initial,
                    quantity: $data->stockCurrent,
                    stockBefore: 0,
                    stockAfter: $data->stockCurrent,
                    userId: $actorUserId,
                    reason: 'Stock inicial al crear producto',
                );
            }

            if (!empty($data->imageFiles)) {
                $this->imageService->uploadForProduct($product, $data->imageFiles);
            }

            return $product->fresh(['category', 'images']);
        });
    }

    public function update(int $id, UpdateProductData $data, ?int $actorUserId = null): Product
    {
        return DB::transaction(function () use ($id, $data, $actorUserId) {
            $product = $this->findForUpdate($id);

            if ($data->sku !== null && $data->sku !== $product->sku) {
                $this->assertSkuAvailable($data->sku, exceptProductId: $product->id);
                $product->sku = $data->sku;
            }

            if ($data->name !== null && $data->name !== $product->name) {
                $product->name = $data->name;
                $product->slug = $this->generateUniqueSlug($data->name, exceptProductId: $product->id);
            }

            if ($data->categoryId !== null && $data->categoryId !== (int) $product->category_id) {
                $this->categoryService->assertExists($data->categoryId);
                $product->category_id = $data->categoryId;
            }

            if ($data->price !== null) {
                $product->price = $data->price;
            }

            if ($data->stockAlert !== null) {
                $product->stock_alert = $data->stockAlert;
            }

            if ($data->isVisible !== null) {
                $product->is_visible = $data->isVisible;
            }

            if ($data->costPriceProvided) {
                $product->cost_price = $data->costPrice;
            }

            if ($data->descriptionProvided) {
                $product->description = $data->description;
            }

            if ($data->specsProvided) {
                $product->specs = $data->specs;
            }

            if ($data->stockCurrent !== null && $data->stockCurrent !== (int) $product->stock_current) {
                $delta = $data->stockCurrent - (int) $product->stock_current;
                $stockBefore = (int) $product->stock_current;

                $product->stock_current = $data->stockCurrent;
                $product->save();

                $this->logMovement(
                    product: $product,
                    type: StockMovementType::Adjustment,
                    quantity: $delta,
                    stockBefore: $stockBefore,
                    stockAfter: $data->stockCurrent,
                    userId: $actorUserId,
                    reason: 'Ajuste manual desde panel admin',
                );
            } else {
                $product->save();
            }

            if (!empty($data->imageFiles)) {
                $this->imageService->uploadForProduct($product, $data->imageFiles);
            }

            return $product->fresh(['category', 'images']);
        });
    }

    public function softDelete(int $id): void
    {
        $product = $this->findForUpdate($id);
        $product->delete();
    }

    public function forceDelete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $product = Product::withTrashed()->with('images')->find($id);

            if (!$product) {
                throw new ProductNotFoundException($id);
            }

            $this->imageService->deleteAllPhysicalFor($product);
            $product->forceDelete();
        });
    }

    public function reserveStock(
        int $productId,
        int $quantity,
        ?int $orderId = null,
        ?int $actorUserId = null,
        ?string $reason = null,
    ): Product {
        $product = $this->findForUpdate($productId);
        $stockBefore = (int) $product->stock_current;

        if ($stockBefore < $quantity) {
            throw new InsufficientStockException($product->name, $stockBefore, $quantity);
        }

        $product->decrement('stock_current', $quantity);
        $stockAfter = $stockBefore - $quantity;

        $this->logMovement(
            product: $product,
            type: StockMovementType::Sale,
            quantity: -$quantity,
            stockBefore: $stockBefore,
            stockAfter: $stockAfter,
            orderId: $orderId,
            userId: $actorUserId,
            reason: $reason ?? 'Reserva por orden',
        );

        return $product->fresh();
    }

    public function restoreStock(
        int $productId,
        int $quantity,
        ?int $orderId = null,
        ?int $actorUserId = null,
        ?string $reason = null,
    ): Product {
        $product = $this->findForUpdate($productId);
        $stockBefore = (int) $product->stock_current;

        $product->increment('stock_current', $quantity);
        $stockAfter = $stockBefore + $quantity;

        $this->logMovement(
            product: $product,
            type: StockMovementType::Restore,
            quantity: $quantity,
            stockBefore: $stockBefore,
            stockAfter: $stockAfter,
            orderId: $orderId,
            userId: $actorUserId,
            reason: $reason ?? 'Restauración por anulación/reembolso',
        );

        return $product->fresh();
    }

    public function adjustStock(
        int $productId,
        int $delta,
        ?int $actorUserId = null,
        ?string $reason = null,
    ): Product {
        return DB::transaction(function () use ($productId, $delta, $actorUserId, $reason) {
            $product = $this->findForUpdate($productId);
            $stockBefore = (int) $product->stock_current;
            $newStock = $stockBefore + $delta;

            if ($newStock < 0) {
                throw new InsufficientStockException($product->name, $stockBefore, abs($delta));
            }

            $product->update(['stock_current' => $newStock]);

            $this->logMovement(
                product: $product,
                type: StockMovementType::Adjustment,
                quantity: $delta,
                stockBefore: $stockBefore,
                stockAfter: $newStock,
                userId: $actorUserId,
                reason: $reason ?? 'Ajuste manual',
            );

            return $product->fresh();
        });
    }

    private function assertSkuAvailable(string $sku, ?int $exceptProductId = null): void
    {
        $query = Product::withTrashed()->where('sku', $sku);

        if ($exceptProductId !== null) {
            $query->where('id', '!=', $exceptProductId);
        }

        if ($query->exists()) {
            throw new DuplicateSkuException($sku);
        }
    }

    private function generateUniqueSlug(string $name, ?int $exceptProductId = null): string
    {
        $base = Str::slug($name);

        if ($base === '') {
            $base = 'producto';
        }

        do {
            $candidate = $base . '-' . Str::random(4);
            $query = Product::withTrashed()->where('slug', $candidate);

            if ($exceptProductId !== null) {
                $query->where('id', '!=', $exceptProductId);
            }
        } while ($query->exists());

        return $candidate;
    }

    private function logMovement(
        Product $product,
        StockMovementType $type,
        int $quantity,
        int $stockBefore,
        int $stockAfter,
        ?int $orderId = null,
        ?int $userId = null,
        ?string $reason = null,
    ): StockMovement {
        return StockMovement::create([
            'product_id'   => $product->id,
            'order_id'     => $orderId,
            'user_id'      => $userId,
            'type'         => $type,
            'quantity'     => $quantity,
            'stock_before' => $stockBefore,
            'stock_after'  => $stockAfter,
            'reason'       => $reason,
        ]);
    }

    private function applyAdminFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['q'])) {
            $needle = trim((string) $filters['q']);
            $query->where(function (Builder $q) use ($needle) {
                $q->where('name', 'like', "%{$needle}%")
                    ->orWhere('sku', 'like', "%{$needle}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (array_key_exists('is_visible', $filters) && $filters['is_visible'] !== '' && $filters['is_visible'] !== null) {
            $query->where('is_visible', filter_var($filters['is_visible'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['low_stock'])) {
            $query->whereColumn('stock_current', '<=', 'stock_alert');
        }
    }
}
