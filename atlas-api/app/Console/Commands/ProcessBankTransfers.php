<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Webklex\IMAP\Facades\Client;
use App\Models\Order;
use App\Models\BankReceipt;
use Carbon\Carbon;

class ProcessBankTransfers extends Command
{
    protected $signature = 'orders:process-transfers';
    protected $description = 'Lee correos de pagos, extrae la glosa y guarda comprobantes en standby o los asocia a órdenes';

    private $allowedEmails = [
        'enviodigital@bancochile.cl',
        'serviciodetransferencias@bancochile.cl',
        'noreply@correo.bancoestado.cl',
        'notificaciones@cl.bancofalabella.com',
        'mensajeria@santander.cl',
        'transferencias@bci.cl',
        'itaupersonas@itau.cl'
    ];

    public function handle()
    {
        $this->info("Iniciando lectura de correos en pagos@tenri.cl...");

        try {
            $client = Client::account('default');
            $client->connect();
            $folder = $client->getFolder('INBOX');
            $messages = $folder->query()->unseen()->since(Carbon::now()->subDays(3))->get();

            foreach ($messages as $message) {
                $subject = $message->getSubject();
                $date = $message->getDate();
                $senderEmail = strtolower(trim($message->getFrom()[0]->mail ?? ''));
                $senderDomain = strtolower(substr(strrchr($senderEmail, "@"), 1));

                if (!in_array($senderEmail, $this->allowedEmails)) {
                    continue;
                }

                $body = $message->hasTextBody() ? $message->getTextBody() : strip_tags($message->getHTMLBody());

                $data = $this->extractDataFromBody($body, $subject);

                if (!$data['amount'] || !$data['transaction_id']) {
                    continue;
                }

                if (BankReceipt::where('transaction_number', $data['transaction_id'])->exists()) {
                    $message->setFlag('Seen');
                    continue;
                }

                $receipt = BankReceipt::create([
                    'bank_domain' => $senderDomain,
                    'amount' => $data['amount'],
                    'transaction_number' => $data['transaction_id'],
                    'sender_name' => $data['sender_name'],
                    'rut_prefix' => $data['rut_prefix'],
                    'glosa' => $data['glosa'],
                    'raw_content' => substr($body, 0, 1000),
                    'transfer_date' => Carbon::parse($date),
                    'status' => 'unmatched'
                ]);

                $order = $this->findMatchingOrder($data, $receipt->transfer_date);

                if ($order) {
                    $receipt->update([
                        'order_id' => $order->id,
                        'status' => 'matched'
                    ]);

                    $order->status = 'paid';
                    $order->transfer_reference = $data['transaction_id'];
                    $order->transfer_date = $receipt->transfer_date;

                    $nota = "✅ Pago asociado automáticamente.\nTransacción: {$data['transaction_id']}\nGlosa/Mensaje: " . ($data['glosa'] ?? 'Sin mensaje');
                    $order->notes = $order->notes ? $order->notes . "\n\n" . $nota : $nota;
                    $order->save();

                    $this->info("¡Comprobante {$data['transaction_id']} asociado a Orden {$order->order_number}!");
                } else {
                    $this->warn("Comprobante {$data['transaction_id']} de $ {$data['amount']} quedó en STANDBY (Requiere revisión manual).");
                }

                $message->setFlag('Seen');
            }

        } catch (\Exception $e) {
            $this->error("Error crítico: " . $e->getMessage());
        }
    }

    private function extractDataFromBody($body, $subject)
    {
        $data = [
            'amount' => null,
            'transaction_id' => null,
            'rut_prefix' => null,
            'sender_name' => null,
            'glosa' => null
        ];

        // Monto
        if (preg_match('/(?:Monto|transferido)[\sA-Za-z:]*\$[\s]*([\d\.]+)/i', $body, $matches)) {
            $data['amount'] = (int) str_replace('.', '', $matches[1]);
        }
        // Transacción
        if (preg_match('/(?:N° de comprobante|N° de transacci[oó]n)[\s:]*(\d+)/i', $body, $matches)) {
            $data['transaction_id'] = $matches[1];
        }
        // RUT
        if (preg_match('/RUT.*?:?\s*([\d\.]+)/i', $body, $matches)) {
            $data['rut_prefix'] = str_replace('.', '', $matches[1]);
        }
        // Nombre (Banco Chile / BancoEstado)
        if (
            preg_match('/que\s+([A-Z\s]+?)\s+te ha transferido/i', $body, $matches) ||
            preg_match('/Nombre o Raz[oó]n Social\s*:\s*([^\n\r]+)/i', $body, $matches)
        ) {
            $data['sender_name'] = trim($matches[1]);
        }

        // --- EXTRACCIÓN DE LA GLOSA / MENSAJE ---
        // Buscamos si el correo dice "Mensaje: pago orden 25" o "Asunto: pedido Tenri"
        if (preg_match('/(?:Mensaje|Asunto|Comentario|Glosa)\s*:\s*([^\n\r]+)/i', $body, $matches)) {
            $data['glosa'] = trim($matches[1]);
        } else {
            $data['glosa'] = $subject;
        }

        return $data;
    }

    private function findMatchingOrder($data, $transferDate)
    {
        $query = Order::where('status', 'pending')->where('payment_method', 'transfer');
        if ($data['glosa']) {
            $glosa = strtoupper($data['glosa']);
            if (preg_match('/(ORD-[A-Z0-9]{8})/', $glosa, $matches)) {
                $order = (clone $query)->where('order_number', $matches[1])->first();
                if ($order && (int) $order->total === (int) $data['amount'])
                    return $order;
            }
            if (preg_match('/(?:PEDIDO|ORDEN|#|NRO)\s*(\d+)/', $glosa, $matches)) {
                $orderId = (int) $matches[1];
                $order = (clone $query)->where('id', $orderId)->first();
                if ($order && (int) $order->total === (int) $data['amount'])
                    return $order;
            }
        }

        if ($data['amount']) {
            $orders = (clone $query)->where('total', $data['amount'])->get();

            foreach ($orders as $order) {
                if ($transferDate->isBefore(Carbon::parse($order->created_at)->subMinutes(30)))
                    continue;

                // Validar por RUT
                if ($data['rut_prefix']) {
                    $orderRutRaw = str_replace('.', '', $order->customer_data['rut'] ?? '');
                    if (str_starts_with($orderRutRaw, $data['rut_prefix']))
                        return $order;
                }

                // Validar por Nombre Difuso
                if ($data['sender_name']) {
                    $customerName = $order->customer_data['nombre'] ?? $order->user->name ?? '';
                    if ($this->isNameMatching($data['sender_name'], $customerName))
                        return $order;
                }
            }
        }

        return null;
    }

    private function isNameMatching($bankName, $customerName)
    {
        if (empty($bankName) || empty($customerName))
            return false;
        $bankWords = explode(' ', strtolower(trim($bankName)));
        $customerWords = explode(' ', strtolower(trim($customerName)));

        foreach ($customerWords as $cWord) {
            if (strlen($cWord) <= 2)
                continue;
            foreach ($bankWords as $bWord) {
                if (str_contains($bWord, $cWord) || str_contains($cWord, $bWord))
                    return true;
            }
        }
        return false;
    }
}