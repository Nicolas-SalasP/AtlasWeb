<?php

namespace App\Domain\Order\Models;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Enums\ShippingProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'notes',
        'shipping_provider',
        'tracking_number',
        'transfer_reference',
        'transfer_date',
        'payment_method',
        'transaction_token',
        'payment_data',
        'terms_accepted_at',
        'terms_accepted_ip',
    ];

    protected $casts = [
        'customer_data'      => 'array',
        'payment_data'       => 'array',
        'subtotal'           => 'integer',
        'shipping_cost'      => 'integer',
        'total'              => 'integer',
        'status'             => OrderStatus::class,
        'shipping_provider'  => ShippingProvider::class,
        'terms_accepted_at'  => 'datetime',
        'transfer_date'      => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class)->orderByDesc('created_at');
    }
}
