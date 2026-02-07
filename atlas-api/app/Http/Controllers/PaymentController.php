<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\SystemSetting; // <--- Asegúrate de tener este import
use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\Options;

class PaymentController extends Controller
{
    // Configuración de Webpay (Integración)
    private function getTransbankOptions()
    {
        return new Options(
            '597012345678',
            '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
            'integration'
        );
    }

    // 1. PAGO CON TRANSFERENCIA (Ahora conecta con tu BD)
    public function payWithTransfer(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        $order = Order::find($request->order_id);
        $order->status = 'pending';
        $order->payment_method = 'transfer';
        $order->save();

        // AQUÍ RECUPERAMOS TUS DATOS DE LA BASE DE DATOS
        return response()->json([
            'message' => 'Intención de transferencia registrada',
            'bank_details' => [
                'bank_name' => SystemSetting::where('key', 'bank_name')->value('value') ?? 'Banco Estado',
                'bank_account_type' => SystemSetting::where('key', 'bank_account_type')->value('value') ?? 'Cuenta Vista',
                'bank_account_number' => SystemSetting::where('key', 'bank_account_number')->value('value') ?? '123456789',
                'bank_rut' => SystemSetting::where('key', 'bank_rut')->value('value') ?? '11.111.111-1',
                'bank_email' => SystemSetting::where('key', 'bank_email')->value('value') ?? 'pagos@tuempresa.cl',
            ]
        ]);
    }

    // 2. INICIAR WEBPAY
    public function initWebpay(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        $order = Order::find($request->order_id);

        $buyOrder = $order->order_number;
        $sessionId = session()->getId();
        $amount = (int) $order->total;
        $returnUrl = url('/api/webpay/return');

        try {
            $options = $this->getTransbankOptions();
            $transaction = new Transaction($options);

            $response = $transaction->create($buyOrder, $sessionId, $amount, $returnUrl);

            $order->transaction_token = $response->getToken();
            $order->status = 'pending';
            $order->payment_method = 'webpay';
            $order->save();

            return response()->json([
                'url' => $response->getUrl(),
                'token' => $response->getToken()
            ]);

        } catch (\Exception $e) {
            \Log::error("Error Webpay Init: " . $e->getMessage());
            return response()->json(['error' => 'Error Webpay: ' . $e->getMessage()], 500);
        }
    }

    // 3. RETORNO WEBPAY
    public function commitWebpay(Request $request)
    {
        $token = $request->input('token_ws');

        if (!$token) {
            $token = $request->input('TBK_TOKEN');
            return redirect('http://localhost:5173/checkout?status=cancelled');
        }

        try {
            $options = $this->getTransbankOptions();
            $transaction = new Transaction($options);

            $response = $transaction->commit($token);

            $order = Order::where('transaction_token', $token)->first();

            if ($response->isApproved()) {
                $order->status = 'paid';
                $order->payment_data = json_encode($response);
                $order->save();

                return redirect('http://localhost:5173/checkout/success?order=' . $order->order_number);
            } else {
                $order->status = 'cancelled';
                $order->save();
                return redirect('http://localhost:5173/checkout/failure?order=' . $order->order_number);
            }

        } catch (\Exception $e) {
            \Log::error("Error Webpay Commit: " . $e->getMessage());
            return redirect('http://localhost:5173/checkout/error');
        }
    }
}