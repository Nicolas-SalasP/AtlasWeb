<?php

namespace App\Domain\Ticket\DTOs;

final readonly class ReplyTicketData
{
    public function __construct(
        public ?string $message,
        public array $attachments,
    ) {
    }

    public static function fromValidated(array $data, array $attachments = []): self
    {
        $message = isset($data['mensaje']) ? trim((string) $data['mensaje']) : null;

        return new self(
            message: $message !== '' ? $message : null,
            attachments: $attachments,
        );
    }
}
