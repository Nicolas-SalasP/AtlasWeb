<?php

namespace App\Domain\System\Services;

use App\Domain\System\DTOs\ContactMessageData;
use App\Mail\ContactMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactService
{
    public function send(ContactMessageData $data): void
    {
        try {
            Mail::to('no-reply@tenri.cl')
                ->cc($data->email)
                ->send(new ContactMessage($data->toMailableArray()));
        } catch (Throwable $e) {
            Log::error('Error enviando mensaje de contacto: ' . $e->getMessage());
            throw $e;
        }
    }
}
