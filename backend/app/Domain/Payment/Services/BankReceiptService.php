<?php

namespace App\Domain\Payment\Services;

use App\Domain\Order\Models\Order;
use App\Domain\Order\Services\OrderService;
use App\Domain\Payment\DTOs\BankTransferData;
use App\Domain\Payment\Enums\BankReceiptStatus;
use App\Domain\Payment\Exceptions\BankReceiptAlreadyMatchedException;
use App\Domain\Payment\Exceptions\BankReceiptNotFoundException;
use App\Domain\Payment\Exceptions\DuplicateBankReceiptException;
use App\Domain\Payment\Models\BankReceipt;
use App\Domain\Payment\Support\BankTransferMatcher;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BankReceiptService
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function listUnmatched(): Collection
    {
        return BankReceipt::where('status', BankReceiptStatus::Unmatched)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findById(int $id): BankReceipt
    {
        $receipt = BankReceipt::find($id);

        if (!$receipt) {
            throw new BankReceiptNotFoundException($id);
        }

        return $receipt;
    }

    public function existsByTransactionNumber(string $transactionNumber): bool
    {
        return BankReceipt::where('transaction_number', $transactionNumber)->exists();
    }

    public function recordFromBankEmail(BankTransferData $transfer): BankReceipt
    {
        if ($this->existsByTransactionNumber($transfer->transactionNumber)) {
            throw new DuplicateBankReceiptException($transfer->transactionNumber);
        }

        return BankReceipt::create([
            'bank_domain'        => $transfer->bankDomain,
            'amount'             => $transfer->amount,
            'transaction_number' => $transfer->transactionNumber,
            'sender_name'        => $transfer->senderName,
            'rut_prefix'         => $transfer->rutPrefix,
            'glosa'              => $transfer->glosa,
            'raw_content'        => $transfer->rawContent,
            'transfer_date'      => $transfer->transferDate,
            'status'             => BankReceiptStatus::Unmatched,
        ]);
    }

    public function attemptAutomaticMatch(BankReceipt $receipt, BankTransferData $transfer): ?Order
    {
        $candidates = $this->orderService->pendingTransfersByAmount($transfer->amount);

        $matched = BankTransferMatcher::matchByGlosa($transfer, $candidates);

        if ($matched === null) {
            $matched = BankTransferMatcher::matchByAmountAndIdentity($transfer, $candidates);
        }

        if ($matched === null) {
            return null;
        }

        return $this->associateReceiptWithOrder(
            receipt: $receipt,
            order: $matched,
            actorUserId: null,
            actorName: null,
            auditReason: $this->buildAutomaticAuditReason($transfer),
        );
    }

    public function associateManually(int $receiptId, int $orderId, ?int $actorUserId, ?string $actorName): Order
    {
        $receipt = $this->findById($receiptId);

        if ($receipt->status === BankReceiptStatus::Matched) {
            throw new BankReceiptAlreadyMatchedException();
        }

        $order = $this->orderService->findByIdOrFail($orderId);

        $reason = "Asociación manual. Transacción: {$receipt->transaction_number}. Glosa: " . ($receipt->glosa ?? 'Sin glosa');

        return $this->associateReceiptWithOrder(
            receipt: $receipt,
            order: $order,
            actorUserId: $actorUserId,
            actorName: $actorName,
            auditReason: $reason,
        );
    }

    private function associateReceiptWithOrder(
        BankReceipt $receipt,
        Order $order,
        ?int $actorUserId,
        ?string $actorName,
        string $auditReason,
    ): Order {
        return DB::transaction(function () use ($receipt, $order, $actorUserId, $actorName, $auditReason) {
            $receipt->update([
                'order_id' => $order->id,
                'status'   => BankReceiptStatus::Matched,
            ]);

            return $this->orderService->markAsPaidFromBankTransfer(
                order: $order,
                transferReference: (string) $receipt->transaction_number,
                transferDate: $receipt->transfer_date,
                actorUserId: $actorUserId,
                actorName: $actorName,
                auditReason: $auditReason,
            );
        });
    }

    private function buildAutomaticAuditReason(BankTransferData $transfer): string
    {
        $glosa = $transfer->glosa ?? 'Sin glosa';

        return "Asociación automática vía email bancario. Transacción: {$transfer->transactionNumber}. Glosa: {$glosa}";
    }
}
