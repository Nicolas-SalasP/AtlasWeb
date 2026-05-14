<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'terms_accepted_ip'
    ];

    /**
     * Campos que NUNCA deben aparecer en respuestas JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
        'password' => 'hashed',
        'terms_accepted_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function billingProfiles()
    {
        return $this->hasMany(BillingProfile::class);
    }
}
