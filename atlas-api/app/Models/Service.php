<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'price', 'duration_days', 'features', 'is_active', 'image_url'];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean'
    ];
}