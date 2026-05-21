<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class FixDoubleEncodedPaymentData extends Command
{
    protected $signature = 'tenri:fix-double-encoded-payment-data
                            {--dry-run : Muestra los cambios sin escribir en la BD}';

    protected $description = 'Detecta y corrige órdenes históricas con payment_data doblemente JSON-encoded.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Modo DRY-RUN: no se realizarán cambios en la base de datos.');
            $this->newLine();
        }

        $rows = DB::table('orders')
            ->whereNotNull('payment_data')
            ->where('payment_data', '!=', '')
            ->select(['id', 'order_number', 'payment_data'])
            ->get();

        $total = $rows->count();
        $alreadyOk = 0;
        $doubleEncoded = 0;
        $corrupted = 0;
        $errors = 0;
        $corruptedSamples = [];

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($rows as $row) {
            try {
                $firstDecode = json_decode((string) $row->payment_data, true);

                if (is_array($firstDecode)) {
                    $alreadyOk++;
                    $bar->advance();
                    continue;
                }

                if (!is_string($firstDecode)) {
                    $corrupted++;
                    $corruptedSamples[] = $row->order_number;
                    $bar->advance();
                    continue;
                }

                $secondDecode = json_decode($firstDecode, true);

                if (!is_array($secondDecode)) {
                    $corrupted++;
                    $corruptedSamples[] = $row->order_number;
                    $bar->advance();
                    continue;
                }

                $doubleEncoded++;

                if (!$dryRun) {
                    $reEncoded = json_encode($secondDecode);
                    if ($reEncoded === false) {
                        $errors++;
                        $bar->advance();
                        continue;
                    }

                    DB::table('orders')
                        ->where('id', $row->id)
                        ->update(['payment_data' => $reEncoded]);
                }
            } catch (Throwable $e) {
                $errors++;
                $this->newLine();
                $this->error("Error en orden {$row->order_number}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Total órdenes inspeccionadas',                              $total],
                ['Ya estaban correctas (single-encoded)',                     $alreadyOk],
                [$dryRun ? 'Doblemente encoded (a corregir)' : 'Corregidas', $doubleEncoded],
                ['Corruptas (no recuperables, dejadas intactas)',             $corrupted],
                ['Errores inesperados',                                       $errors],
            ]
        );

        if (!empty($corruptedSamples)) {
            $this->newLine();
            $this->warn('Órdenes con payment_data corrupto (revisar manualmente):');
            foreach (array_slice($corruptedSamples, 0, 10) as $orderNumber) {
                $this->line("  - {$orderNumber}");
            }

            if (count($corruptedSamples) > 10) {
                $remaining = count($corruptedSamples) - 10;
                $this->line("  ...y {$remaining} más.");
            }
        }

        if ($dryRun && $doubleEncoded > 0) {
            $this->newLine();
            $this->info("Vuelve a ejecutar sin --dry-run para aplicar los {$doubleEncoded} cambios.");
        }

        return self::SUCCESS;
    }
}
