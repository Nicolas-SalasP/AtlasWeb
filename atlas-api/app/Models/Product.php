<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku', 'name', 'slug', 'description', 
        'price', 'cost_price', 
        'stock_current', 'stock_alert', 
        'category_id', 'is_visible'
    ];

    // Relación con Categoría
    public function category() {
        return $this->belongsTo(Category::class);
    }

    // Relación con Imágenes
    public function images() {
        return $this->hasMany(ProductImage::class);
    }

    // Helper para obtener la imagen de portada
    public function getCoverAttribute()
    {
        return $this->images->where('is_cover', true)->first()->url ?? null;
    }
}