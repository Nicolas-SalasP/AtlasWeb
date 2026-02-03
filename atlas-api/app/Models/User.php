<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role_id', 'avatar', 'company_name', 'is_active'
    ];

    // Relación: Un usuario tiene un Rol
    public function role() {
        return $this->belongsTo(Role::class);
    }

    // Un usuario tiene muchos Tickets
    public function tickets() {
        return $this->hasMany(Ticket::class);
    }
}