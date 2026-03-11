<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\Options;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private function getTransbankOptions()
    {
        $dbEnv = SystemSetting::where('key', 'webpay_env')->value('value');
        $environment = ($dbEnv === 'production') ? Options::ENVIRONMENT_PRODUCTION : Options::ENVIRONMENT_INTEGRATION;

        if ($environment === Options::ENVIRONMENT_INTEGRATION) {
            $commerceCode = '597055555532';
            $apiKey = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
        } else {
            $commerceCode = SystemSetting::where('key', 'webpay_code')->value('value');
            $apiKey = SystemSetting::where('key', 'webpay_api_key')->value('value');
        }

        return new Options($commerceCode, $apiKey, $environment);
    }

    public function initWebpay(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        try {
            $isEnabled = SystemSetting::where('key', 'webpay_enabled')->value('value');
            if ($isEnabled !== null && $isEnabled !== '1') {
                return response()->json(['error' => 'Pago con Webpay no habilitado'], 403);
            }

            $order = Order::findOrFail($request->order_id);
            $amount = (int) round($order->total);
            $buyOrder = 'ORD-' . $order->id . '-' . time();
            $sessionId = session()->getId();
            $returnUrl = url('/api/webpay/return');

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

        } catch (\Throwable $e) {
            Log::error("Webpay Init Error: " . $e->getMessage());
            return response()->json([
                'error' => 'Error iniciando Webpay: ' . $e->getMessage()
            ], 500);
        }
    }

    public function payWithTransfer(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        try {
            $order = Order::findOrFail($request->order_id);

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
                    Log::error("Error enviando correo transferencia: " . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Intención de transferencia registrada',
                'bank_details' => $bankDetails
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function commitWebpay(Request $request)
    {
        $token = $request->input('token_ws') ?? $request->input('TBK_TOKEN');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if (!$token || $request->input('TBK_ACCION') === 'anular') {
            return redirect($frontendUrl . '/checkout/failure?reason=cancelled');
        }

        try {
            $options = $this->getTransbankOptions();
            $transaction = new Transaction($options);
            $response = $transaction->commit($token);

            $order = Order::where('transaction_token', $token)->first();

            if (!$order) {
                return redirect($frontendUrl . '/checkout/failure?reason=order_not_found');
            }

            if ($response->isApproved()) {
                $order->status = 'paid';
                $order->payment_data = json_encode($response);
                $order->save();

                return redirect($frontendUrl . '/checkout/success?order=' . $order->order_number);
            } else {
                $order->status = 'cancelled';
                $order->payment_data = json_encode($response);
                $order->save();
                return redirect($frontendUrl . '/checkout/failure?order=' . $order->order_number);
            }

        } catch (\Exception $e) {
            Log::error("Error Webpay Commit: " . $e->getMessage());
            return redirect($frontendUrl . '/checkout/failure?reason=exception');
        }
    }
}