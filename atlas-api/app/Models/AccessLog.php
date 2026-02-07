<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'ip_address',
        'city',
        'region',
        'action',
        'user_agent',
        'created_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}