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
        'subtotal',         // Coincide con controller
        'shipping_cost',
        'total',            // Coincide con controller (antes era total_amount)
        'status',
        'shipping_address', // Coincide con controller
        'customer_data',    // Coincide con controller
        'notes'
    ];

    protected $casts = [
        'customer_data' => 'array', // Vital para que el JSON funcione
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