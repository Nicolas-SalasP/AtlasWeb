<?php

namespace App\Domain\System\Services;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Domain\Product\Models\Product;
use App\Domain\Ticket\Enums\TicketStatus;
use App\Domain\Ticket\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private const DASHBOARD_CACHE_KEY = 'admin_dashboard_summary';
    private const DASHBOARD_TTL = 300;
    private const NOTIFICATIONS_CACHE_KEY = 'admin_notifications_summary';
    private const NOTIFICATIONS_TTL = 60;

    public function summary(): array
    {
        return Cache::remember(self::DASHBOARD_CACHE_KEY, self::DASHBOARD_TTL, function () {
            return $this->buildSummary();
        });
    }

    public function notifications(): array
    {
        return Cache::remember(self::NOTIFICATIONS_CACHE_KEY, self::NOTIFICATIONS_TTL, function () {
            return [
                'pending_orders' => Order::where('status', OrderStatus::Pending)->count(),
                'new_tickets'    => Ticket::where('status', TicketStatus::Nuevo)->count(),
            ];
        });
    }

    public function clearCache(): void
    {
        Cache::forget(self::DASHBOARD_CACHE_KEY);
        Cache::forget(self::NOTIFICATIONS_CACHE_KEY);
    }

    private function buildSummary(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfPrevMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfPrevMonth = $now->copy()->subMonth()->endOfMonth();

        $ventasMes = (int) Order::where('status', OrderStatus::Paid)
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total');

        $pedidosTotalHistorico = Order::count();
        $pedidosMes = Order::where('status', OrderStatus::Paid)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $ticketPromedio = $pedidosMes > 0 ? (int) round($ventasMes / $pedidosMes) : 0;

        $ticketsMes = Ticket::where('created_at', '>=', $startOfMonth)->count();
        $ticketsMesAnterior = Ticket::whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])->count();

        $tendenciaTickets = $ticketsMesAnterior > 0
            ? round((($ticketsMes - $ticketsMesAnterior) / $ticketsMesAnterior) * 100, 1)
            : 0;

        $chartData = $this->buildSalesChart($now);
        $topProductos = $this->buildTopProducts();
        $topZonas = $this->buildTopZones();
        $insights = $this->buildInsights($topZonas);

        return [
            'kpis' => [
                'ventas'     => ['value' => $ventasMes, 'trend' => 12.5],
                'pedidos'    => ['value' => $pedidosTotalHistorico, 'trend' => 5.2],
                'ticket'     => ['value' => $ticketPromedio, 'trend' => 0],
                'conversion' => ['value' => '2.4%', 'trend' => 0.5],
                'reclamos'   => ['value' => $ticketsMes, 'trend' => $tendenciaTickets],
            ],
            'top_products' => $topProductos,
            'top_zones'    => $topZonas,
            'insights'     => $insights,
            'chart_data'   => $chartData,
        ];
    }

    private function buildSalesChart(Carbon $reference): array
    {
        $chartData = [];
        for ($i = 9; $i >= 0; $i--) {
            $date = $reference->copy()->subDays($i)->format('Y-m-d');
            $total = (int) Order::where('status', OrderStatus::Paid)
                ->whereDate('created_at', $date)
                ->sum('total');
            $chartData[] = $total;
        }

        return $chartData;
    }

    private function buildTopProducts(): Collection
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.name as nombre',
                'products.stock_current as stock',
                DB::raw('SUM(order_items.quantity) as ventas'),
                DB::raw('SUM(order_items.total_line) as ingresos')
            )
            ->groupBy('products.id', 'products.name', 'products.stock_current')
            ->orderByDesc('ventas')
            ->limit(4)
            ->get();
    }

    private function buildTopZones(): Collection
    {
        $zones = DB::table('orders')
            ->join('addresses', 'orders.address_id', '=', 'addresses.id')
            ->select('addresses.commune as comuna', DB::raw('count(*) as envios'))
            ->where('orders.status', OrderStatus::Paid->value)
            ->whereNotNull('addresses.commune')
            ->groupBy('addresses.commune')
            ->orderByDesc('envios')
            ->limit(5)
            ->get();

        $total = (int) $zones->sum('envios');

        return $zones->map(function ($zona) use ($total) {
            $zona->porcentaje = $total > 0 ? (int) round(($zona->envios / $total) * 100) : 0;

            return $zona;
        });
    }

    private function buildInsights(Collection $topZonas): array
    {
        $insights = [];

        $productosBajos = Product::whereColumn('stock_current', '<=', 'stock_alert')->count();

        if ($productosBajos > 0) {
            $insights[] = [
                'type'    => 'warning',
                'title'   => 'Stock Crítico Detectado',
                'message' => "Tienes {$productosBajos} productos con stock bajo. Reabastecer urgente.",
                'icon'    => 'alert',
            ];
        } else {
            $insights[] = [
                'type'    => 'success',
                'title'   => 'Inventario Saludable',
                'message' => 'Niveles de stock óptimos.',
                'icon'    => 'check',
            ];
        }

        if ($topZonas->isNotEmpty()) {
            $zonaTop = $topZonas->first();
            $insights[] = [
                'type'    => 'info',
                'title'   => 'Zona Top',
                'message' => "La mayoría de ventas son en {$zonaTop->comuna}.",
                'icon'    => 'map',
            ];
        }

        return $insights;
    }
}
