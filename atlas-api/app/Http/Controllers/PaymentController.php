<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\Options;

class PaymentController extends Controller
{
    private function getTransbankOptions()
    {
        $env = SystemSetting::where('key', 'webpay_env')->value('value') ?? 'integration';
        $code = SystemSetting::where('key', 'webpay_code')->value('value') ?? '597012345678';
        $apiKey = SystemSetting::where('key', 'webpay_api_key')->value('value') ?? '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

        return new Options($code, $apiKey, $env);
    }

    public function payWithTransfer(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        $order = Order::find($request->order_id);
        if ($order->status === 'paid') {
            return response()->json(['message' => 'La orden ya está pagada'], 400);
        }

        $order->status = 'pending';
        $order->payment_method = 'transfer';
        $order->save();

        $bankDetails = [
            'bank_name' => SystemSetting::where('key', 'bank_name')->value('value') ?? 'Banco Estado',
            'bank_account_type' => SystemSetting::where('key', 'bank_account_type')->value('value') ?? 'Cuenta Vista',
            'bank_account_number' => SystemSetting::where('key', 'bank_account_number')->value('value') ?? '123456789',
            'bank_rut' => SystemSetting::where('key', 'bank_rut')->value('value') ?? '11.111.111-1',
            'bank_email' => SystemSetting::where('key', 'bank_email')->value('value') ?? 'pagos@tuempresa.cl',
        ];

        $clientEmail = $order->customer_data['email'] ?? null;
        if ($clientEmail) {
            try {
                Mail::to($clientEmail)->send(new OrderPlaced($order, $bankDetails));
            } catch (\Exception $e) {
                \Log::error("Error enviando correo transferencia: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Intención de transferencia registrada',
            'bank_details' => $bankDetails
        ]);
    }

    public function initWebpay(Request $request)
    {
        $isEnabled = SystemSetting::where('key', 'webpay_enabled')->value('value');
        if ($isEnabled !== '1') {
            return response()->json(['error' => 'Pago con Webpay no habilitado'], 403);
        }

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
            return response()->json(['error' => 'Error al iniciar Webpay'], 500);
        }
    }

    public function commitWebpay(Request $request)
    {
        $token = $request->input('token_ws') ?? $request->input('TBK_TOKEN');
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        if (!$token) {
            return redirect($frontendUrl . '/checkout?status=cancelled');
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

                $clientEmail = $order->customer_data['email'] ?? null;
                if ($clientEmail) {
                    Mail::to($clientEmail)->send(new OrderPlaced($order));
                }

                return redirect($frontendUrl . '/checkout/success?order=' . $order->order_number);
            } else {
                $order->status = 'cancelled';
                $order->save();
                return redirect($frontendUrl . '/checkout/failure?order=' . $order->order_number);
            }

        } catch (\Exception $e) {
            \Log::error("Error Webpay Commit: " . $e->getMessage());
            return redirect($frontendUrl . '/checkout/error');
        }
    }
}