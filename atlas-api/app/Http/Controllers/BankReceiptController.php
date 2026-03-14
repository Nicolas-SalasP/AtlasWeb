<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankReceipt;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        if ($receipt->status === 'matched') {
            return response()->json(['message' => 'Rechazado: Este comprobante ya ha sido vinculado a una orden anteriormente.'], 422);
        }
        if (in_array($order->status, ['paid', 'cancelled', 'refunded'])) {
            return response()->json(['message' => "No se puede vincular: La orden ya se encuentra en estado '{$order->status}'."], 422);
        }

        try {

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

            DB::commit();

            return response()->json(['message' => 'Comprobante asociado exitosamente']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error crítico vinculando comprobante bancario: " . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error interno al intentar procesar la vinculación.'], 500);
        }
    }
}