<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\SystemSetting;
use Transbank\Webpay\WebpayPlus\Transaction;
use Illuminate\Support\Facades\Log;

class WebpayController extends Controller
{
    private $transaction;

    public function __construct()
    {
        $this->transaction = new Transaction();
        
        $commerceCode = SystemSetting::where('key', 'webpay_code')->value('value');
        $isEnabled = SystemSetting::where('key', 'webpay_enabled')->value('value');
        if ($isEnabled !== '1') {
            // En producción, aquí configurarías el entorno real
            // Por defecto el SDK viene en modo INTEGRACIÓN (Pruebas)
        }
    }

    /**
     * Paso 1: Iniciar la transacción
     */
    public function iniciarPago(Request $request)
    {
        $orderId = $request->order_id;
        $order = Order::findOrFail($orderId);

        // Generamos datos de la transacción
        $buyOrder = "ORD-" . $order->id . "-" . time();
        $sessionId = session()->getId();
        $amount = $order->total;
        
        // URL a la que Transbank enviará al cliente tras pagar
        $returnUrl = url('/api/webpay/confirmar');

        try {
            $response = $this->transaction->create($buyOrder, $sessionId, $amount, $returnUrl);
            
            // Guardamos el token en la orden para validarlo después
            $order->update([
                'status' => 'pending',
                'notes' => 'Token Webpay: ' . $response->getToken()
            ]);

            return response()->json([
                'url' => $response->getUrl(),
                'token' => $response->getToken()
            ]);

        } catch (\Exception $e) {
            Log::error("Error iniciando Webpay: " . $e->getMessage());
            return response()->json(['message' => 'No se pudo iniciar el pago'], 500);
        }
    }

    /**
     * Paso 2: Retorno desde Transbank
     */
    public function confirmarPago(Request $request)
    {
        $token = $request->input('token_ws');

        if (!$token) {
            return response()->json(['message' => 'Pago anulado por el usuario'], 400);
        }

        try {
            $response = $this->transaction->commit($token);

            if ($response->isApproved()) {
                // PAGO EXITOSO
                $orderId = explode('-', $response->getBuyOrder())[1];
                $order = Order::find($orderId);
                
                $order->update([
                    'status' => 'paid', // Usamos tu enum 'paid'
                ]);

                // Aquí podrías disparar correos de confirmación o bajar stock

                // Redirigir al frontend a una página de éxito
                return redirect()->away(env('FRONTEND_URL') . '/checkout/success?order=' . $order->id);
            } else {
                // PAGO RECHAZADO
                return redirect()->away(env('FRONTEND_URL') . '/checkout/error?reason=rejected');
            }

        } catch (\Exception $e) {
            Log::error("Error confirmando Webpay: " . $e->getMessage());
            return redirect()->away(env('FRONTEND_URL') . '/checkout/error?reason=failed');
        }
    }
}