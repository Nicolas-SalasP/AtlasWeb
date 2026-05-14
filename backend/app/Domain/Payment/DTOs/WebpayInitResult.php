<?php

namespace App\Domain\Payment\DTOs;

final readonly class WebpayInitResult
{
    public function __construct(
        public string $url,
        public string $token,
    ) {
    }
}
