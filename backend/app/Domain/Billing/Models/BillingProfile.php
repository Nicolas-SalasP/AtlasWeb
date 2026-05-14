<?php

namespace App\Domain\Billing\Models;

use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillingProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'rut',
        'business_name',
        'business_line',
        'address',
        'city',
        'email_dte',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
