<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $user = auth('sanctum')->user();

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_cost' => 'required|numeric',
            'customer_data' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $subtotalOrden = 0; // Usamos nombre distinto para no confundir
            $itemsToInsert = [];

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['id']);

                // Verificar Stock
                if ($product->stock_current < $item['quantity']) {
                    return response()->json(['message' => "Stock insuficiente para {$product->name}"], 400);
                }

                // Descontar Stock
                $product->decrement('stock_current', $item['quantity']);

                $lineTotal = $product->price * $item['quantity'];
                $subtotalOrden += $lineTotal;

                // --- AQUÍ ESTABA EL ERROR ---
                // Ahora usamos los nombres EXACTOS de tu tabla order_items
                $itemsToInsert[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku_snapshot' => $product->sku,
                    'quantity' => $item['quantity'],

                    'unit_price' => $product->price, // CORREGIDO: unit_price
                    'total_line' => $lineTotal       // CORREGIDO: total_line
                ];
            }

            $shipping = $request->shipping_cost;
            $total = $subtotalOrden + $shipping;

            // Crear la Orden (Esto estaba bien con tu tabla orders)
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

            // Guardar Items
            foreach ($itemsToInsert as $itemData) {
                $order->items()->create($itemData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Orden creada exitosamente',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'assigned_user_id' => $order->user_id,
                'is_guest_checkout' => is_null($order->user_id)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Error creando orden: " . $e->getMessage());
            return response()->json(['message' => 'Error al procesar la orden', 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        return Order::with(['user', 'items'])->orderBy('created_at', 'desc')->get();
    }
}