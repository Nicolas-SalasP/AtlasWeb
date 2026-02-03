<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['parent_id', 'name', 'slug', 'is_active'];

    public function products() {
        return $this->hasMany(Product::class);
    }

    public function children() {
        return $this->hasMany(Category::class, 'parent_id');
    }
}
