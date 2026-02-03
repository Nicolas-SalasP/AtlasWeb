<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku', 'name', 'slug', 'description', 'price', 
        'stock_current', 'category_id', 'is_visible'
    ];

    // Relación con Categoría
    public function category() {
        return $this->belongsTo(Category::class);
    }

    // Relación con Imágenes
    public function images() {
        return $this->hasMany(ProductImage::class);
    }
}