<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\Options; // <--- Clase necesaria para configurar

class PaymentController extends Controller
{
    /**
     * Helper robusto para obtener la instancia de Transbank.
     * Soluciona el error de "Missing argument $options" y métodos desconocidos.
     */
    private function getTransactionInstance()
    {
        // 1. Intentar leer credenciales de Producción desde la BD
        $cc = SystemSetting::where('key', 'webpay_code')->value('value');
        $apiKey = SystemSetting::where('key', 'webpay_api_key')->value('value');
        
        // Asumimos 'integration' si no está definido explícitamente como 'production'
        $env = SystemSetting::where('key', 'webpay_env')->value('value') ?? 'integration';

        if ($env === 'production' && !empty($cc) && !empty($apiKey)) {
            // --- MODO PRODUCCIÓN ---
            // Creamos las opciones manualmente pasando 'PRODUCTION' como string
            $options = new Options($cc, $apiKey, 'PRODUCTION');
        } else {
            // --- MODO INTEGRACIÓN (TEST) ---
            // Credenciales públicas oficiales de Transbank. Las ponemos aquí directo
            // para evitar errores de constantes faltantes en versiones nuevas del SDK.
            $integrationCC = '597055555532';
            $integrationKey = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
            
            $options = new Options($integrationCC, $integrationKey, 'TEST');
        }

        // Retornamos la transacción lista con las opciones inyectadas
        return new Transaction($options);
    }

    // --- 1. PROCESAR TRANSFERENCIA BANCARIA ---
    public function payWithTransfer(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);
        $order = Order::find($request->order_id);
        
        // Evitar duplicar lógicas si el usuario hace clic varias veces
        if ($order->status !== 'pending' && $order->status !== 'pending_payment') {
            return response()->json(['message' => 'Esta orden ya está en proceso o pagada'], 400);
        }

        $order->update([
            'payment_method' => 'transfer',
            'status' => 'pending_payment'
        ]);

        // Datos del banco para mostrar en el frontend
        $bankDetails = SystemSetting::whereIn('key', [
            'bank_name', 'bank_account_type', 'bank_account_number', 'bank_rut', 'bank_email'
        ])->pluck('value', 'key');

        // Enviar correo de instrucciones
        try {
            Mail::to($order->user->email)->send(new OrderPlaced($order, $bankDetails));
        } catch (\Exception $e) {
            Log::error("Error enviando email transferencia: " . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Orden registrada. Instrucciones enviadas al correo.',
            'bank_details' => $bankDetails
        ]);
    }

    // --- 2. INICIAR WEBPAY PLUS ---
    public function initWebpay(Request $request)
    {
        $request->validate(['order_id' => 'required']);
        $order = Order::findOrFail($request->order_id);

        // 1. Validar Stock antes de ir al banco (Crucial para evitar sobreventas)
        foreach ($order->items as $item) {
            if ($item->product->stock_current < $item->quantity) {
                return response()->json(['error' => "Sin stock suficiente para: {$item->product->name}"], 409);
            }
        }

        try {
            // 2. Obtener instancia configurada (Producción o Integración)
            $transaction = $this->getTransactionInstance();
            
            // 3. Preparar datos de la transacción
            $buyOrder = "ORD-" . $order->id . "-" . rand(1000, 9999); // ID único aleatorio
            $sessionId = session()->getId();
            $amount = round($order->total); // Webpay solo acepta enteros
            $returnUrl = url('/api/webpay/return'); 

            // 4. Crear transacción en Transbank
            $response = $transaction->create($buyOrder, $sessionId, $amount, $returnUrl);

            // 5. Guardar token en nuestra BD
            $order->update([
                'payment_method' => 'webpay',
                'transaction_token' => $response->getToken(),
                'status' => 'pending_payment'
            ]);

            // 6. Responder al frontend con URL y Token
            return response()->json([
                'url' => $response->getUrl(),
                'token' => $response->getToken()
            ]);

        } catch (\Exception $e) {
            Log::error("Webpay Init Error: " . $e->getMessage());
            return response()->json(['error' => 'Error al conectar con Webpay. Intente más tarde.'], 500);
        }
    }

    // --- 3. RETORNO WEBPAY (CONFIRMACIÓN) ---
    public function commitWebpay(Request $request)
    {
        // Transbank envía el token por POST o GET
        $token = $request->input('token_ws');

        // Si no hay token, es porque el usuario anuló la compra en el formulario del banco
        if (!$token) {
            return redirect()->away(env('FRONTEND_URL') . '/checkout/failure?reason=aborted');
        }

        try {
            // Instancia configurada
            $transaction = $this->getTransactionInstance();
            
            // Confirmar transacción con Transbank (Commit)
            $response = $transaction->commit($token); 

            // Buscar nuestra orden
            $order = Order::where('transaction_token', $token)->firstOrFail();

            // Verificar si el banco aprobó el pago (Código 0)
            if ($response->isApproved()) {
                
                // Transacción DB Atómica: O se guarda todo o nada
                DB::transaction(function () use ($order, $response) {
                    // A. Marcar pagado
                    $order->update([
                        'status' => 'paid',
                        'payment_data' => json_encode($response)
                    ]);

                    // B. Descontar Stock
                    foreach ($order->items as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->decrement('stock_current', $item->quantity);
                        }
                    }
                });

                // C. Enviar correo de éxito
                try {
                    Mail::to($order->user->email)->send(new OrderPlaced($order));
                } catch (\Exception $e) {
                    Log::error("Error email webpay: " . $e->getMessage());
                }
                
                // Redirigir al frontend (Éxito)
                return redirect()->away(env('FRONTEND_URL') . '/checkout/success?order_id=' . $order->id);
            } else {
                // Pago rechazado por el banco (Sin fondos, clave errónea, etc.)
                $order->update(['status' => 'cancelled', 'notes' => 'Rechazado por Webpay']);
                return redirect()->away(env('FRONTEND_URL') . '/checkout/failure?reason=rejected');
            }

        } catch (\Exception $e) {
            Log::error("Webpay Commit Error: " . $e->getMessage());
            // Error técnico (Timeout, doble confirmación, etc)
            return redirect()->away(env('FRONTEND_URL') . '/checkout/failure?reason=error');
        }
    }
}