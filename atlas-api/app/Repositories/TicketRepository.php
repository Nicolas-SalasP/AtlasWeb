<?php

namespace App\Repositories;

use App\Models\Ticket;
use Illuminate\Support\Collection;

class TicketRepository
{
    public function getByUser($userId): Collection
    {
        return Ticket::where('user_id', $userId)
            ->with(['messages', 'messages.user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAll(): Collection
    {
        return Ticket::with(['user', 'messages', 'messages.user'])
            ->orderByRaw("FIELD(status, 'nuevo', 'abierto', 'cerrado')")
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function find($id): ?Ticket
    {
        return Ticket::with(['messages.user', 'user'])->find($id);
    }
    
    public function update($id, array $data)
    {
        $ticket = Ticket::find($id);
        if ($ticket) {
            $ticket->update($data);
        }
        return $ticket;
    }
    
    public function create(array $data): Ticket
    {
        return Ticket::create($data);
    }
}