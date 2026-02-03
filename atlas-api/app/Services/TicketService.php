<?php

namespace App\Services;

use App\Models\TicketMessage;
use App\Repositories\TicketRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TicketService
{
    protected $ticketRepo;

    public function __construct(TicketRepository $ticketRepo)
    {
        $this->ticketRepo = $ticketRepo;
    }

    public function createTicketWithFirstMessage($userId, array $data)
    {
        return DB::transaction(function () use ($userId, $data) {
            $ticket = $this->ticketRepo->create([
                'ticket_code' => 'TK-' . strtoupper(Str::random(6)),
                'user_id' => $userId,
                'subject' => $data['asunto'],
                'category' => $data['categoria'],
                'priority' => $data['prioridad'],
                'status' => 'nuevo'
            ]);

            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'message' => $data['mensaje']
            ]);

            return $ticket->load('messages');
        });
    }

    public function addReply($userId, $ticketId, $message, $attachments = [])
    {
        $filesData = [];

        if (!empty($attachments)) {
            foreach ($attachments as $file) {
                $path = $file->store('tickets', 'public');
                $filesData[] = [
                    'path' => '/storage/' . $path,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType()
                ];
            }
        }

        return TicketMessage::create([
            'ticket_id' => $ticketId,
            'user_id' => $userId,
            'message' => $message,
            'attachments' => $filesData
        ]);
    }
    
    public function getUserTickets($userId)
    {
        return $this->ticketRepo->getByUser($userId);
    }

    public function getAllTickets()
    {
        return $this->ticketRepo->getAll();
    }

    public function changeStatus($ticketId, $status)
    {
        return $this->ticketRepo->update($ticketId, ['status' => $status]);
    }
}