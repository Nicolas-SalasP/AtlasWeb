<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankReceipt;
use App\Models\Order;

class BankReceiptController extends Controller
{
    // Devuelve todos los comprobantes que no tienen orden
    public function getUnmatched()
    {
        return response()->json(BankReceipt::where('status', 'unmatched')->orderBy('created_at', 'desc')->get());
    }

    // Vincula manualmente el comprobante a la orden
    public function manualMatch(Request $request, $id)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);
        
        $receipt = BankReceipt::findOrFail($id);
        $order = Order::findOrFail($request->order_id);

        $receipt->update([
            'order_id' => $order->id,
            'status' => 'matched'
        ]);

        $order->status = 'paid';
        $order->transfer_reference = $receipt->transaction_number;
        $order->transfer_date = $receipt->transfer_date;
        
        $nota = "✅ Pago asociado MANUALMENTE.\nTransacción: {$receipt->transaction_number}\nGlosa: " . ($receipt->glosa ?? 'Sin glosa');
        $order->notes = $order->notes ? $order->notes . "\n\n" . $nota : $nota;
        $order->save();

        return response()->json(['message' => 'Comprobante asociado exitosamente']);
    }
}