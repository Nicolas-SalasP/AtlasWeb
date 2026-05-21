<?php

namespace App\Domain\Ticket\DTOs;

use App\Domain\Ticket\Enums\TicketCategory;
use App\Domain\Ticket\Enums\TicketPriority;

final readonly class CreateTicketData
{
    public function __construct(
        public string $subject,
        public TicketCategory $category,
        public TicketPriority $priority,
        public string $firstMessage,
        public array $attachments,
    ) {
    }

    public static function fromValidated(array $data, array $attachments = []): self
    {
        return new self(
            subject: trim((string) $data['asunto']),
            category: TicketCategory::from((string) $data['categoria']),
            priority: TicketPriority::from((string) $data['prioridad']),
            firstMessage: trim((string) $data['mensaje']),
            attachments: $attachments,
        );
    }
}
