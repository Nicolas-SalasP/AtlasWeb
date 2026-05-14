<?php

namespace App\Domain\Payment\DTOs;

use Carbon\CarbonImmutable;
use DateTimeInterface;

final readonly class BankTransferData
{
    public function __construct(
        public string $bankDomain,
        public int $amount,
        public string $transactionNumber,
        public ?string $senderName,
        public ?string $rutPrefix,
        public ?string $glosa,
        public ?string $rawContent,
        public CarbonImmutable $transferDate,
    ) {
    }

    public static function fromParsedEmail(array $parsed, string $bankDomain, DateTimeInterface $transferDate, ?string $rawContent): self
    {
        return new self(
            bankDomain: $bankDomain,
            amount: (int) ($parsed['amount'] ?? 0),
            transactionNumber: (string) ($parsed['transaction_id'] ?? ''),
            senderName: isset($parsed['sender_name']) ? trim((string) $parsed['sender_name']) : null,
            rutPrefix: isset($parsed['rut_prefix']) ? (string) $parsed['rut_prefix'] : null,
            glosa: isset($parsed['glosa']) ? (string) $parsed['glosa'] : null,
            rawContent: $rawContent !== null ? substr($rawContent, 0, 1000) : null,
            transferDate: CarbonImmutable::instance(
                $transferDate instanceof CarbonImmutable
                    ? $transferDate
                    : CarbonImmutable::parse($transferDate->format(DATE_ATOM))
            ),
        );
    }

    public function isComplete(): bool
    {
        return $this->amount > 0 && $this->transactionNumber !== '';
    }
}
