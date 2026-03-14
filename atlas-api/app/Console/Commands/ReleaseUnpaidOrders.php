<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReleaseUnpaidOrders extends Command
{
    protected $signature = 'orders:release-unpaid';
    protected $description = 'Cancela órdenes pendientes de más de 2 horas y libera el stock retenido';

    public function handle()
    {
        $thresholdTime = Carbon::now()->subHours(2);

        $zombieOrders = Order::with('items')
            ->where('status', 'pending')
            ->where('created_at', '<', $thresholdTime)
            ->get();

        if ($zombieOrders->isEmpty()) {
            $this->info('No se encontraron órdenes zombis para limpiar.');
            return;
        }

        $releasedCount = 0;

        foreach ($zombieOrders as $order) {
            try {
                DB::beginTransaction();

                foreach ($order->items as $item) {
                    if (!is_null($item->product_id)) {
                        Product::where('id', $item->product_id)
                            ->lockForUpdate()
                            ->increment('stock_current', $item->quantity);
                    }
                }

                $notaAutomatica = "🤖 Cancelada automáticamente por el sistema: Tiempo de espera de pago agotado (> 2 horas). Stock liberado.";
                $nuevaNota = $order->notes ? $order->notes . "\n\n" . $notaAutomatica : $notaAutomatica;
                Order::where('id', $order->id)->update([
                    'status' => 'cancelled',
                    'notes' => $nuevaNota
                ]);

                DB::commit();
                $releasedCount++;

                Log::info("Orden Zombi Liberada: {$order->order_number}. Stock devuelto al inventario.");

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error liberando la orden {$order->order_number}: " . $e->getMessage());
                $this->error("Fallo al liberar la orden {$order->order_number}. Revisa los logs.");
            }
        }

        $this->info("¡Limpieza completada! Se liberaron {$releasedCount} órdenes zombis.");
    }
}