<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $hoy = Carbon::now();
        $inicioMes = $hoy->copy()->startOfMonth();

        // ---------------------------------------------------
        // KPI: VENTAS (Dinero del Mes)
        // ---------------------------------------------------
        $ventasMes = Order::where('status', 'paid')
            ->where('created_at', '>=', $inicioMes)
            ->sum('total');

        // ---------------------------------------------------
        // KPI: PEDIDOS (Total Histórico vs Mes)
        // ---------------------------------------------------
        $pedidosTotalHistorico = Order::count();
        $pedidosMes = Order::where('status', 'paid')
            ->where('created_at', '>=', $inicioMes)
            ->count();

        // ---------------------------------------------------
        // KPI: VALOR PROMEDIO (Corregido)
        // ---------------------------------------------------
        $ticketPromedio = $pedidosMes > 0 ? round($ventasMes / $pedidosMes) : 0;

        // ---------------------------------------------------
        //  KPI: RECLAMOS / TICKETS 
        // ---------------------------------------------------
        $ticketsMes = Ticket::where('created_at', '>=', $inicioMes)->count();
        $inicioMesAnterior = $hoy->copy()->subMonth()->startOfMonth();
        $finMesAnterior = $hoy->copy()->subMonth()->endOfMonth();
        $ticketsMesAnterior = Ticket::whereBetween('created_at', [$inicioMesAnterior, $finMesAnterior])->count();

        $tendenciaTickets = 0;
        if ($ticketsMesAnterior > 0) {
            $tendenciaTickets = round((($ticketsMes - $ticketsMesAnterior) / $ticketsMesAnterior) * 100, 1);
        }

        // ---------------------------------------------------
        // GRÁFICO DE VENTAS (Últimos 10 días)
        // ---------------------------------------------------
        $chartData = [];
        for ($i = 9; $i >= 0; $i--) {
            $date = $hoy->copy()->subDays($i)->format('Y-m-d');
            $total = Order::where('status', 'paid')->whereDate('created_at', $date)->sum('total');
            $chartData[] = (int)$total;
        }

        // ---------------------------------------------------
        // TOP PRODUCTOS
        // ---------------------------------------------------
        $topProductos = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name as nombre', 'products.stock_current as stock', DB::raw('SUM(order_items.quantity) as ventas'), DB::raw('SUM(order_items.total_line) as ingresos'))
            ->groupBy('products.id', 'products.name', 'products.stock_current')
            ->orderByDesc('ventas')
            ->limit(4)
            ->get();

        // ---------------------------------------------------
        // TOP ZONAS
        // ---------------------------------------------------
        $topZonas = DB::table('orders')
            ->join('addresses', 'orders.address_id', '=', 'addresses.id')
            ->join('communes', 'addresses.commune_id', '=', 'communes.id')
            ->select('communes.name as comuna', DB::raw('count(*) as envios'))
            ->where('orders.status', 'paid')
            ->groupBy('communes.name')
            ->orderByDesc('envios')
            ->limit(5)
            ->get();

        $totalEnviosGeolocalizados = $topZonas->sum('envios');
        $zonasConPorcentaje = $topZonas->map(function($zona) use ($totalEnviosGeolocalizados) {
            $zona->porcentaje = $totalEnviosGeolocalizados > 0 ? round(($zona->envios / $totalEnviosGeolocalizados) * 100) : 0;
            return $zona;
        });

        // ---------------------------------------------------
        // INSIGHTS & ALERTAS
        // ---------------------------------------------------
        $insights = [];

        $productosBajos = Product::where('stock_current', '<=', 5)->count();
        
        if ($productosBajos > 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Stock Crítico Detectado',
                'message' => "Tienes {$productosBajos} productos con stock bajo. Reabastecer urgente.",
                'icon' => 'alert'
            ];
        } else {
            $insights[] = [
                'type' => 'success',
                'title' => 'Inventario Saludable',
                'message' => "Niveles de stock óptimos.",
                'icon' => 'check'
            ];
        }

        if ($topZonas->isNotEmpty()) {
            $zonaTop = $topZonas->first();
            $insights[] = [
                'type' => 'info',
                'title' => 'Zona Top',
                'message' => "La mayoría de ventas son en {$zonaTop->comuna}.",
                'icon' => 'map'
            ];
        }

        // ---------------------------------------------------
        // RESPUESTA FINAL JSON
        // ---------------------------------------------------
        return response()->json([
            'kpis' => [
                'ventas' => ['value' => (int)$ventasMes, 'trend' => 12.5],
                'pedidos' => ['value' => $pedidosTotalHistorico, 'trend' => 5.2],
                'ticket' => ['value' => $ticketPromedio, 'trend' => 0],
                'conversion' => ['value' => '2.4%', 'trend' => 0.5],
                'reclamos' => ['value' => $ticketsMes, 'trend' => $tendenciaTickets]
            ],
            'top_products' => $topProductos,
            'top_zones' => $zonasConPorcentaje,
            'insights' => $insights,
            'chart_data' => $chartData
        ]);
    }
}