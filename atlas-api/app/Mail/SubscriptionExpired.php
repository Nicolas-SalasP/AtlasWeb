<?php

namespace App\Mail;

use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpired extends Mailable
{
    use Queueable, SerializesModels;

    public $item;
    public function __construct(OrderItem $item)
    {
        $this->item = $item;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu suscripción ha finalizado - Atlas Digital',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.expired',
        );
    }
}