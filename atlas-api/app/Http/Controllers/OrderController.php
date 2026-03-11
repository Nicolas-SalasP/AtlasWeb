<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;

class OrderController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        if ($user->role_id === 1) {
            return Order::with(['user', 'items'])->orderBy('created_at', 'desc')->get();
        }

        return Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function show($id)
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $order = Order::with(['user', 'items'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        }

        if ($user->role_id !== 1 && $order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Acceso denegado. No tienes permisos para ver esta orden.'
            ], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $user = auth('sanctum')->user();

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required', 
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_cost' => 'required|numeric',
            'customer_data' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $subtotalOrden = 0;
            $itemsToInsert = [];

            foreach ($request->items as $item) {
                $idStr = (string)$item['id'];
                if (str_starts_with($idStr, 'service-')) {
                    $serviceId = str_replace('service-', '', $idStr);
                    $service = Service::findOrFail($serviceId);

                    $lineTotal = $service->price * $item['quantity'];
                    
                    $itemsToInsert[] = [
                        'product_id' => null,
                        'service_id' => $service->id,
                        'product_name' => $service->name,
                        'sku_snapshot' => 'SRV-' . $service->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $service->price,
                        'total_line' => $lineTotal,
                        'item_status' => 'active' 
                    ];
                    
                    $subtotalOrden += $lineTotal;

                } else {
                    $product = Product::where('id', $item['id'])->lockForUpdate()->first();

                    if (!$product) {
                        throw new \Exception("El producto ID {$item['id']} no existe.");
                    }

                    if ($product->stock_current < $item['quantity']) {
                        DB::rollBack();
                        return response()->json(['message' => "Stock insuficiente para {$product->name}. Quedan {$product->stock_current} unidades."], 400);
                    }

                    $product->decrement('stock_current', $item['quantity']);

                    $lineTotal = $product->price * $item['quantity'];
                    
                    $itemsToInsert[] = [
                        'product_id' => $product->id,
                        'service_id' => null,
                        'product_name' => $product->name,
                        'sku_snapshot' => $product->sku,
                        'quantity' => $item['quantity'],
                        'unit_price' => $product->price,
                        'total_line' => $lineTotal,
                        'item_status' => 'sold'
                    ];

                    $subtotalOrden += $lineTotal;
                }
            }

            $shipping = $request->shipping_cost;
            $total = $subtotalOrden + $shipping;

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'status' => 'pending', 
                'subtotal' => $subtotalOrden,
                'shipping_cost' => $shipping,
                'total' => $total,
                'shipping_address' => $request->shipping_address,
                'customer_data' => $request->customer_data,
            ]);

            foreach ($itemsToInsert as $itemData) {
                $order->items()->create($itemData);
            }

            DB::commit();
            try {
                $clientEmail = $request->customer_data['email'] ?? null;
                if ($clientEmail) {
                    Mail::to($clientEmail)->send(new OrderPlaced($order));
                }
            } catch (\Exception $e) {
                Log::error("Error enviando email confirmación: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Orden creada exitosamente',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'assigned_user_id' => $order->user_id,
                'is_guest_checkout' => is_null($order->user_id)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Critical Order Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al procesar la orden', 
                'error' => 'Ocurrió un problema interno. Por favor intenta nuevamente.'
            ], 500);
        }
    }
}