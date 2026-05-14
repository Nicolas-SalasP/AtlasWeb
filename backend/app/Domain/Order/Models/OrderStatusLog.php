<?php

namespace App\Domain\Order\Models;

use App\Domain\Order\Enums\OrderStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'from_status',
        'to_status',
        'actor_name',
        'reason',
    ];

    protected $casts = [
        'from_status' => OrderStatus::class,
        'to_status'   => OrderStatus::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
