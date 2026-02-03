<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role_id !== 1) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $orders = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }
}