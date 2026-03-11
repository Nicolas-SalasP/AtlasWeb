<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'user_id',
        'rut',
        'subtotal',
        'shipping_cost',
        'total',
        'status',
        'shipping_address',
        'customer_data',
        'notes'
    ];

    protected $casts = [
        'customer_data' => 'array',
        'subtotal' => 'integer',
        'shipping_cost' => 'integer',
        'total' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}