<?php

namespace App\Http\Resources\Ticket;

use App\Domain\Ticket\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var TicketMessage $message */
        $message = $this->resource;

        return [
            'id'          => $message->id,
            'ticket_id'   => $message->ticket_id,
            'user_id'     => $message->user_id,
            'message'     => $message->message,
            'attachments' => $message->attachments ?? [],
            'created_at'  => $message->created_at?->toIso8601String(),
            'user'        => $this->whenLoaded('user', fn () => $message->user ? [
                'id'      => $message->user->id,
                'name'    => $message->user->name,
                'role_id' => (int) $message->user->role_id,
            ] : null),
        ];
    }
}
