<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_code', 'user_id', 'subject', 'category', 'priority', 'status'
    ];

    public function messages() {
        return $this->hasMany(TicketMessage::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}