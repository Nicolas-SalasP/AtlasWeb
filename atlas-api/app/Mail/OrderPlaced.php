<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;

class OrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $bankDetails;

    public function __construct(Order $order, $bankDetails = null)
    {
        $this->order = $order;
        $this->bankDetails = $bankDetails;
    }

    public function build()
    {
        $subject = $this->order->payment_method === 'transfer' 
            ? 'Instrucciones de Transferencia - Orden #' . $this->order->id
            : 'Confirmación de Compra - Orden #' . $this->order->id;

        return $this->subject($subject)
                    ->view('emails.orders.placed');
    }
}