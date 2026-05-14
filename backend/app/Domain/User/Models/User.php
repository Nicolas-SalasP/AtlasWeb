<?php

namespace App\Domain\User\Models;

use App\Domain\Order\Models\Order;
use App\Domain\Billing\Models\BillingProfile;
use App\Domain\Ticket\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'rut',
        'email',
        'password',
        'role_id',
        'permissions',
        'is_active',
        'google_id',
        'avatar',
        'phone',
        'address',
        'terms_accepted_at',
        'terms_accepted_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected $casts = [
        'permissions'       => 'array',
        'is_active'         => 'boolean',
        'password'          => 'hashed',
        'terms_accepted_at' => 'datetime',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function billingProfiles(): HasMany
    {
        return $this->hasMany(BillingProfile::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class)->orderByDesc('created_at');
    }
}
