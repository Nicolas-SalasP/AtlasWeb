<?php

namespace App\Domain\System\Services;

use App\Domain\Catalog\Models\Service;
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
    private const DASHBOARD_CACHE_KEY   = 'admin_dashboard_summary';
    private const DASHBOARD_TTL         = 300;
    private const NOTIFICATIONS_CACHE_KEY = 'admin_notifications_summary';
    private const NOTIFICATIONS_TTL     = 60;

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
        $now            = Carbon::now();
        $startOfMonth   = $now->copy()->startOfMonth();
        $startOfPrevMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfPrevMonth = $now->copy()->subMonth()->endOfMonth();

        $ventasMes = (int) Order::where('status', OrderStatus::Paid)
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total');

        $pedidosTotalHistorico = Order::count();
        $pedidosMes = Order::where('status', OrderStatus::Paid)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $ticketPromedio  = $pedidosMes > 0 ? (int) round($ventasMes / $pedidosMes) : 0;
        $ticketsMes      = Ticket::where('created_at', '>=', $startOfMonth)->count();
        $ticketsMesAnterior = Ticket::whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])->count();
        $tendenciaTickets = $ticketsMesAnterior > 0
            ? round((($ticketsMes - $ticketsMesAnterior) / $ticketsMesAnterior) * 100, 1)
            : 0;

        $chartData      = $this->buildSalesChart($now);
        $topProductos   = $this->buildTopProducts();
        $topZonas       = $this->buildTopZones();
        $insights       = $this->buildInsights($topZonas);
        $financiero     = $this->buildFinanciero($startOfMonth);
        $erpStats       = $this->buildErpStats($startOfMonth);

        return [
            'kpis' => [
                'ventas'     => ['value' => $ventasMes,               'trend' => 12.5],
                'pedidos'    => ['value' => $pedidosTotalHistorico,    'trend' => 5.2],
                'ticket'     => ['value' => $ticketPromedio,           'trend' => 0],
                'conversion' => ['value' => '2.4%',                   'trend' => 0.5],
                'reclamos'   => ['value' => $ticketsMes,               'trend' => $tendenciaTickets],
            ],
            'top_products' => $topProductos,
            'top_zones'    => $topZonas,
            'insights'     => $insights,
            'chart_data'   => $chartData,
            'financiero'   => $financiero,
            'erp_stats'    => $erpStats,
        ];
    }

    private function buildFinanciero(Carbon $startOfMonth): array
    {
        $paidStatus = OrderStatus::Paid->value;

        $productosRaw = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->where('o.status', $paidStatus)
            ->where('o.created_at', '>=', $startOfMonth)
            ->whereNotNull('oi.product_id')
            ->select(
                DB::raw('SUM(oi.total_line) as ingresos'),
                DB::raw('SUM(oi.quantity * COALESCE(p.cost_price, 0)) as costos')
            )
            ->first();

        $ingresosProductos = (int) ($productosRaw->ingresos ?? 0);
        $costosProductos   = (int) ($productosRaw->costos ?? 0);

        $serviciosRaw = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('services as s', 'oi.service_id', '=', 's.id')
            ->where('o.status', $paidStatus)
            ->where('o.created_at', '>=', $startOfMonth)
            ->whereNotNull('oi.service_id')
            ->select(
                DB::raw('SUM(oi.total_line) as ingresos'),
                's.costo_operacional',
                's.module_keys',
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('s.id', 's.costo_operacional', 's.module_keys')
            ->get();

        $ingresosServicios = 0;
        $costosServicios   = 0;

        foreach ($serviciosRaw as $row) {
            $ingresosServicios += (int) $row->ingresos;
            $costoOp = json_decode($row->costo_operacional ?? '{}', true) ?? [];
            $moduleKeys = json_decode($row->module_keys ?? '[]', true) ?? [];
            $costoTotal = 0;
            foreach ($moduleKeys as $key) {
                $costoTotal += (int) ($costoOp[$key] ?? 0);
            }
            $costosServicios += $costoTotal * (int) $row->cantidad;
        }

        $ingresosTotales = $ingresosProductos + $ingresosServicios;
        $costosTotales   = $costosProductos + $costosServicios;
        $margenBruto     = $ingresosTotales - $costosTotales;
        $margenPct       = $ingresosTotales > 0
            ? round(($margenBruto / $ingresosTotales) * 100, 1)
            : 0;

        $margenProductosPct = $ingresosProductos > 0
            ? round((($ingresosProductos - $costosProductos) / $ingresosProductos) * 100, 1)
            : null;

        $margenServiciosPct = $ingresosServicios > 0
            ? round((($ingresosServicios - $costosServicios) / $ingresosServicios) * 100, 1)
            : null;

        return [
            'productos' => [
                'ingresos' => $ingresosProductos,
                'costos'   => $costosProductos,
                'margen'   => $ingresosProductos - $costosProductos,
                'margen_pct' => $margenProductosPct,
            ],
            'servicios' => [
                'ingresos' => $ingresosServicios,
                'costos'   => $costosServicios,
                'margen'   => $ingresosServicios - $costosServicios,
                'margen_pct' => $margenServiciosPct,
            ],
            'total' => [
                'ingresos'   => $ingresosTotales,
                'costos'     => $costosTotales,
                'margen'     => $margenBruto,
                'margen_pct' => $margenPct,
            ],
        ];
    }

    private function buildErpStats(Carbon $startOfMonth): array
    {
        $paidStatus = OrderStatus::Paid->value;

        $suscripcionesActivas = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('services as s', 'oi.service_id', '=', 's.id')
            ->where('o.status', $paidStatus)
            ->where('s.slug', 'like', 'erp-%')
            ->distinct('o.user_id')
            ->count('o.user_id');

        $nuevasSuscripciones = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('services as s', 'oi.service_id', '=', 's.id')
            ->where('o.status', $paidStatus)
            ->where('o.created_at', '>=', $startOfMonth)
            ->where('s.slug', 'like', 'erp-%')
            ->count();

        $porPlan = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('services as s', 'oi.service_id', '=', 's.id')
            ->where('o.status', $paidStatus)
            ->where('s.slug', 'like', 'erp-%')
            ->select('s.name as plan', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('s.id', 's.name')
            ->orderByDesc('cantidad')
            ->get();

        return [
            'suscripciones_activas'   => $suscripcionesActivas,
            'nuevas_este_mes'         => $nuevasSuscripciones,
            'distribucion_por_plan'   => $porPlan,
        ];
    }

    private function buildSalesChart(Carbon $reference): array
    {
        $chartData = [];
        for ($i = 9; $i >= 0; $i--) {
            $date  = $reference->copy()->subDays($i)->format('Y-m-d');
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
                'products.cost_price as costo_unitario',
                'products.price as precio_unitario',
                DB::raw('SUM(order_items.quantity) as ventas'),
                DB::raw('SUM(order_items.total_line) as ingresos'),
                DB::raw('SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as costo_total')
            )
            ->groupBy('products.id', 'products.name', 'products.stock_current', 'products.cost_price', 'products.price')
            ->orderByDesc('ventas')
            ->limit(4)
            ->get()
            ->map(function ($p) {
                $p->margen_pct = $p->ingresos > 0
                    ? round((($p->ingresos - $p->costo_total) / $p->ingresos) * 100, 1)
                    : null;
                return $p;
            });
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
            $zonaTop  = $topZonas->first();
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
