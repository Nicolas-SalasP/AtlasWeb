<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $hoy = Carbon::now();
    
        $inicioMes = $hoy->copy()->startOfMonth();
        $ventasMes = Order::where('status', 'paid')->where('created_at', '>=', $inicioMes)->sum('total');
        $pedidosTotal = Order::count();
        $ticketPromedio = $pedidosTotal > 0 ? round($ventasMes / ($pedidosTotal ?: 1)) : 0;

        $chartData = [];
        for ($i = 9; $i >= 0; $i--) {
            $date = $hoy->copy()->subDays($i)->format('Y-m-d');
            $total = Order::where('status', 'paid')->whereDate('created_at', $date)->sum('total');
            $chartData[] = (int)$total;
        }

        $topProductos = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name as nombre', 'products.stock_current as stock', DB::raw('SUM(order_items.quantity) as ventas'), DB::raw('SUM(order_items.total_line) as ingresos'))
            ->groupBy('products.id', 'products.name', 'products.stock_current')
            ->orderByDesc('ventas')
            ->limit(4)
            ->get();

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

        $insights = [];

        $productosBajos = Product::whereColumn('stock_current', '<=', 'stock_alert')->count();
        if ($productosBajos > 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Stock Crítico Detectado',
                'message' => "Tienes {$productosBajos} productos por debajo del nivel de seguridad. Reabastecer urgente.",
                'icon' => 'alert'
            ];
        } else {
            $insights[] = [
                'type' => 'success',
                'title' => 'Inventario Saludable',
                'message' => "Tu niveles de stock están óptimos para la demanda actual.",
                'icon' => 'check'
            ];
        }

        if ($topZonas->isNotEmpty()) {
            $zonaTop = $topZonas->first();
            $insights[] = [
                'type' => 'info',
                'title' => 'Oportunidad Local',
                'message' => "El {$zonaTop->porcentaje}% de tus ventas son en {$zonaTop->comuna}. Considera activar envío express allí.",
                'icon' => 'map'
            ];
        }

        return response()->json([
            'kpis' => [
                'ventas' => ['value' => (int)$ventasMes, 'trend' => 12.5],
                'pedidos' => ['value' => $pedidosTotal, 'trend' => 5.2],
                'ticket' => ['value' => $ticketPromedio, 'trend' => -1.5],
                'conversion' => ['value' => '2.4%', 'trend' => 0.5]
            ],
            'top_products' => $topProductos,
            'top_zones' => $zonasConPorcentaje,
            'insights' => $insights,
            'chart_data' => $chartData
        ]);
    }
}