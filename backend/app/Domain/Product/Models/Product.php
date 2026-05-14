<?php

namespace App\Domain\Product\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'slug',
        'description',
        'price',
        'cost_price',
        'stock_current',
        'stock_alert',
        'category_id',
        'is_visible',
        'specs',
    ];

    protected $casts = [
        'specs'         => 'array',
        'is_visible'    => 'boolean',
        'price'         => 'integer',
        'cost_price'    => 'integer',
        'stock_current' => 'integer',
        'stock_alert'   => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class)->orderByDesc('created_at');
    }

    public function getCoverAttribute(): ?string
    {
        return $this->images->firstWhere('is_cover', true)?->url
            ?? $this->images->first()?->url;
    }
}
