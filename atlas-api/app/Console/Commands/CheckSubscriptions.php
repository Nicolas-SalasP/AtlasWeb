<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail; // <--- FALTABA ESTO
use App\Mail\SubscriptionExpired;    // <--- FALTABA ESTO

class CheckSubscriptions extends Command
{
    protected $signature = 'subscriptions:check';
    protected $description = 'Verifica servicios vencidos y notifica al usuario';

    public function handle()
    {
        $this->info('Iniciando revisión de suscripciones...');

        $activeServices = OrderItem::whereNotNull('service_id')
            ->where('item_status', 'active')
            ->whereHas('order', function($q) {
                $q->where('status', 'paid');
            })
            ->with(['order', 'service'])
            ->get();

        $count = 0;

        foreach ($activeServices as $item) {
            if (!$item->order || !$item->service) continue;

            $startDate = $item->order->created_at;
            $durationDays = $item->service->duration_days;
            $expirationDate = $startDate->copy()->addDays($durationDays);

            if (Carbon::now()->greaterThan($expirationDate)) {
                $item->update(['item_status' => 'expired']);
                Log::info("Suscripción vencida detectada: Orden #{$item->order->order_number} - Item: {$item->product_name}");
                $clientEmail = $item->order->customer_data['email'] ?? null;

                if ($clientEmail) {
                    try {
                        Mail::to($clientEmail)->send(new SubscriptionExpired($item));
                        $this->info("Correo enviado a: {$clientEmail}");
                    } catch (\Exception $e) {
                        Log::error("Error enviando correo de expiración: " . $e->getMessage());
                    }
                }

                $count++;
            }
        }

        $this->info("Proceso finalizado. {$count} suscripciones han sido marcadas como expiradas.");
    }
}