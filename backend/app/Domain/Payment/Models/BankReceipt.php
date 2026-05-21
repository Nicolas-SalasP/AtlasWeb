<?php

namespace App\Domain\Payment\Models;

use App\Domain\Order\Models\Order;
use App\Domain\Payment\Enums\BankReceiptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_domain',
        'amount',
        'transaction_number',
        'sender_name',
        'rut_prefix',
        'glosa',
        'raw_content',
        'order_id',
        'status',
        'transfer_date',
    ];

    protected $casts = [
        'amount'        => 'integer',
        'status'        => BankReceiptStatus::class,
        'transfer_date' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
