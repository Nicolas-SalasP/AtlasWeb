<?php

namespace App\Domain\Payment\Support;

final class BankEmailParser
{
    public static function parse(string $body, ?string $subject = null): array
    {
        $data = [
            'amount'         => null,
            'transaction_id' => null,
            'rut_prefix'     => null,
            'sender_name'    => null,
            'glosa'          => null,
        ];

        if (preg_match('/(?:Monto|transferido)[\sA-Za-z:]*\$[\s]*([\d\.]+)/i', $body, $matches)) {
            $data['amount'] = (int) str_replace('.', '', $matches[1]);
        }

        if (preg_match('/(?:N° de comprobante|N° de transacci[oó]n)[\s:]*(\d+)/i', $body, $matches)) {
            $data['transaction_id'] = $matches[1];
        }

        if (preg_match('/RUT.*?:?\s*([\d\.]+)/i', $body, $matches)) {
            $data['rut_prefix'] = str_replace('.', '', $matches[1]);
        }

        if (
            preg_match('/que\s+([A-Z\s]+?)\s+te ha transferido/i', $body, $matches)
            || preg_match('/Nombre o Raz[oó]n Social\s*:\s*([^\n\r]+)/i', $body, $matches)
        ) {
            $data['sender_name'] = trim($matches[1]);
        }

        if (preg_match('/(?:Mensaje|Asunto|Comentario|Glosa)\s*:\s*([^\n\r]+)/i', $body, $matches)) {
            $data['glosa'] = trim($matches[1]);
        } elseif ($subject !== null) {
            $data['glosa'] = $subject;
        }

        return $data;
    }
}
