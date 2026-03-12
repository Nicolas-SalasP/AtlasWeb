<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankReceipt extends Model
{
    protected $fillable = [
        'bank_domain', 'amount', 'transaction_number', 'sender_name', 
        'rut_prefix', 'glosa', 'raw_content', 'order_id', 'status', 'transfer_date'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}