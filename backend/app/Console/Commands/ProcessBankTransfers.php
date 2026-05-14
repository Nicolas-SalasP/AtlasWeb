<?php

namespace App\Console\Commands;

use App\Domain\Payment\DTOs\BankTransferData;
use App\Domain\Payment\Exceptions\DuplicateBankReceiptException;
use App\Domain\Payment\Services\BankReceiptService;
use App\Domain\Payment\Support\AllowedBankEmails;
use App\Domain\Payment\Support\BankEmailParser;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Throwable;
use Webklex\IMAP\Facades\Client;

class ProcessBankTransfers extends Command
{
    protected $signature = 'orders:process-transfers';

    protected $description = 'Lee correos de pagos, extrae la glosa y guarda comprobantes en standby o los asocia a órdenes';

    public function __construct(private readonly BankReceiptService $bankReceiptService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Iniciando lectura de correos en pagos@tenri.cl...');

        try {
            $client = Client::account('default');
            $client->connect();

            $folder = $client->getFolder('INBOX');
            $messages = $folder->query()
                ->unseen()
                ->since(Carbon::now()->subDays(3))
                ->get();

            foreach ($messages as $message) {
                $this->processMessage($message);
            }
        } catch (Throwable $e) {
            $this->error('Error crítico: ' . $e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function processMessage($message): void
    {
        $subject = (string) $message->getSubject();
        $date = $message->getDate();
        $senderEmail = strtolower(trim($message->getFrom()[0]->mail ?? ''));
        $senderDomain = strtolower(substr(strrchr($senderEmail, '@') ?: '@', 1));

        if (!AllowedBankEmails::isAllowed($senderEmail)) {
            return;
        }

        $body = $message->hasTextBody()
            ? (string) $message->getTextBody()
            : (string) strip_tags((string) $message->getHTMLBody());

        $parsed = BankEmailParser::parse($body, $subject);

        if (empty($parsed['amount']) || empty($parsed['transaction_id'])) {
            return;
        }

        if ($this->bankReceiptService->existsByTransactionNumber((string) $parsed['transaction_id'])) {
            $message->setFlag('Seen');

            return;
        }

        $transfer = BankTransferData::fromParsedEmail(
            parsed: $parsed,
            bankDomain: $senderDomain,
            transferDate: $date,
            rawContent: $body,
        );

        try {
            $receipt = $this->bankReceiptService->recordFromBankEmail($transfer);
        } catch (DuplicateBankReceiptException) {
            $message->setFlag('Seen');

            return;
        } catch (Throwable $e) {
            $this->error("Error guardando comprobante {$transfer->transactionNumber}: " . $e->getMessage());

            return;
        }

        try {
            $matchedOrder = $this->bankReceiptService->attemptAutomaticMatch($receipt, $transfer);
        } catch (Throwable $e) {
            $this->warn("Comprobante {$transfer->transactionNumber} no pudo asociarse automáticamente: " . $e->getMessage());
            $matchedOrder = null;
        }

        if ($matchedOrder !== null) {
            $this->info("¡Comprobante {$transfer->transactionNumber} asociado a Orden {$matchedOrder->order_number}!");
        } else {
            $this->warn("Comprobante {$transfer->transactionNumber} de $ {$transfer->amount} quedó en STANDBY (Requiere revisión manual).");
        }

        $message->setFlag('Seen');
    }
}
