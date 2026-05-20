<?php

namespace App\Domain\Catalog\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'price_uf',
        'price_label',
        'duration_days',
        'features',
        'module_keys',
        'is_active',
        'is_popular',
        'image_url',
    ];

    protected $casts = [
        'features' => 'array',
        'module_keys' => 'array',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'price' => 'integer',
        'duration_days' => 'integer',
    ];
}
