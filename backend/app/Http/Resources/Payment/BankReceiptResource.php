<?php

namespace App\Http\Resources\Payment;

use App\Domain\Payment\Models\BankReceipt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BankReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var BankReceipt $receipt */
        $receipt = $this->resource;

        return [
            'id'                 => $receipt->id,
            'bank_domain'        => $receipt->bank_domain,
            'amount'             => (int) $receipt->amount,
            'transaction_number' => $receipt->transaction_number,
            'sender_name'        => $receipt->sender_name,
            'rut_prefix'         => $receipt->rut_prefix,
            'glosa'              => $receipt->glosa,
            'raw_content'        => $receipt->raw_content,
            'order_id'           => $receipt->order_id,
            'status'             => $receipt->status?->value,
            'status_label'       => $receipt->status?->label(),
            'transfer_date'      => $receipt->transfer_date?->toIso8601String(),
            'created_at'         => $receipt->created_at?->toIso8601String(),
        ];
    }
}
