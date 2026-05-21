<?php

namespace App\Http\Resources\Ticket;

use App\Domain\Ticket\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Ticket $ticket */
        $ticket = $this->resource;

        return [
            'id'             => $ticket->id,
            'ticket_code'    => $ticket->ticket_code,
            'subject'        => $ticket->subject,
            'category'       => $ticket->category?->value,
            'category_label' => $ticket->category?->label(),
            'priority'       => $ticket->priority?->value,
            'priority_label' => $ticket->priority?->label(),
            'status'         => $ticket->status?->value,
            'status_label'   => $ticket->status?->label(),
            'user_id'        => $ticket->user_id,
            'assigned_to'    => $ticket->assigned_to,
            'messages_count' => $ticket->messages_count
                ?? ($ticket->relationLoaded('messages') ? $ticket->messages->count() : 0),
            'created_at'     => $ticket->created_at?->toIso8601String(),
            'updated_at'     => $ticket->updated_at?->toIso8601String(),
            'user'           => $this->whenLoaded('user', fn () => $ticket->user ? [
                'id'    => $ticket->user->id,
                'name'  => $ticket->user->name,
                'email' => $ticket->user->email,
            ] : null),
            'assignee'       => $this->whenLoaded('assignee', fn () => $ticket->assignee ? [
                'id'   => $ticket->assignee->id,
                'name' => $ticket->assignee->name,
            ] : null),
            'messages'       => TicketMessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
