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
        'description',
        'price',
        'duration_days',
        'features',
        'is_active',
        'image_url',
    ];

    protected $casts = [
        'features'      => 'array',
        'is_active'     => 'boolean',
        'price'         => 'integer',
        'duration_days' => 'integer',
    ];
}
