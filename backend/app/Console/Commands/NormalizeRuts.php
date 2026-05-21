<?php

namespace App\Console\Commands;

use App\Domain\Billing\Support\RutValidator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class NormalizeRuts extends Command
{
    protected $signature = 'tenri:normalize-ruts
                            {--dry-run : Muestra los cambios sin escribir en la BD}
                            {--audit : Solo lista RUTs con dígito verificador inválido, sin modificar nada}';

    protected $description = 'Normaliza el formato de todos los RUTs en la base de datos al formato canónico (12.345.678-K) usando el algoritmo Módulo 11.';

    private int $totalScanned = 0;
    private int $totalNormalized = 0;
    private int $totalInvalid = 0;
    private int $totalErrors = 0;
    private array $invalidSamples = [];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $audit = (bool) $this->option('audit');

        if ($audit) {
            $this->warn('Modo AUDIT: solo se listarán RUTs inválidos, sin modificar nada.');
        } elseif ($dryRun) {
            $this->warn('Modo DRY-RUN: no se realizarán cambios en la base de datos.');
        }
        $this->newLine();

        $this->info('1/4 — users.rut');
        $this->normalizeSimpleColumn('users', 'rut', 'email', $dryRun, $audit);

        $this->newLine();
        $this->info('2/4 — orders.rut');
        $this->normalizeSimpleColumn('orders', 'rut', 'order_number', $dryRun, $audit);

        $this->newLine();
        $this->info('3/4 — billing_profiles.rut');
        $this->normalizeSimpleColumn('billing_profiles', 'rut', 'business_name', $dryRun, $audit);

        $this->newLine();
        $this->info('4/4 — orders.customer_data.rut (JSON)');
        $this->normalizeCustomerDataRut($dryRun, $audit);

        $this->newLine(2);
        $this->displayFinalReport($dryRun, $audit);

        return self::SUCCESS;
    }

    private function normalizeSimpleColumn(string $table, string $column, string $labelColumn, bool $dryRun, bool $audit): void
    {
        $rows = DB::table($table)
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->select(['id', $column, $labelColumn])
            ->get();

        $localScanned = $rows->count();
        $localNormalized = 0;
        $localInvalid = 0;

        $bar = $this->output->createProgressBar($localScanned);
        $bar->start();

        foreach ($rows as $row) {
            try {
                $original = (string) $row->{$column};
                $normalized = RutValidator::normalize($original);
                $isValid = RutValidator::isValid($original);

                if (!$isValid) {
                    $localInvalid++;
                    $this->invalidSamples[] = "{$table}.{$column} ({$row->{$labelColumn}}): {$original}";
                }

                if ($audit) {
                    $bar->advance();
                    continue;
                }

                if ($normalized !== '' && $normalized !== $original) {
                    $localNormalized++;

                    if (!$dryRun) {
                        DB::table($table)
                            ->where('id', $row->id)
                            ->update([$column => $normalized]);
                    }
                }
            } catch (Throwable $e) {
                $this->totalErrors++;
                $this->newLine();
                $this->error("Error en {$table}#{$row->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->line(sprintf(
            '   Escaneados: %d, Normalizados: %d, Inválidos: %d',
            $localScanned,
            $localNormalized,
            $localInvalid
        ));

        $this->totalScanned += $localScanned;
        $this->totalNormalized += $localNormalized;
        $this->totalInvalid += $localInvalid;
    }

    private function normalizeCustomerDataRut(bool $dryRun, bool $audit): void
    {
        $rows = DB::table('orders')
            ->whereNotNull('customer_data')
            ->select(['id', 'order_number', 'customer_data'])
            ->get();

        $localScanned = 0;
        $localNormalized = 0;
        $localInvalid = 0;

        $bar = $this->output->createProgressBar($rows->count());
        $bar->start();

        foreach ($rows as $row) {
            try {
                $data = json_decode((string) $row->customer_data, true);

                if (!is_array($data) || !isset($data['rut']) || !is_string($data['rut']) || $data['rut'] === '') {
                    $bar->advance();
                    continue;
                }

                $localScanned++;
                $original = $data['rut'];
                $normalized = RutValidator::normalize($original);
                $isValid = RutValidator::isValid($original);

                if (!$isValid) {
                    $localInvalid++;
                    $this->invalidSamples[] = "orders.customer_data.rut ({$row->order_number}): {$original}";
                }

                if ($audit) {
                    $bar->advance();
                    continue;
                }

                if ($normalized !== '' && $normalized !== $original) {
                    $localNormalized++;
                    $data['rut'] = $normalized;

                    if (!$dryRun) {
                        $reEncoded = json_encode($data);
                        if ($reEncoded !== false) {
                            DB::table('orders')
                                ->where('id', $row->id)
                                ->update(['customer_data' => $reEncoded]);
                        }
                    }
                }
            } catch (Throwable $e) {
                $this->totalErrors++;
                $this->newLine();
                $this->error("Error en orders#{$row->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->line(sprintf(
            '   Con RUT en JSON: %d, Normalizados: %d, Inválidos: %d',
            $localScanned,
            $localNormalized,
            $localInvalid
        ));

        $this->totalScanned += $localScanned;
        $this->totalNormalized += $localNormalized;
        $this->totalInvalid += $localInvalid;
    }

    private function displayFinalReport(bool $dryRun, bool $audit): void
    {
        $action = match (true) {
            $audit   => 'Modo audit: cero modificaciones',
            $dryRun  => 'A normalizar (dry-run, sin escribir)',
            default  => 'Normalizados',
        };

        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Total RUTs escaneados',           $this->totalScanned],
                [$action,                           $this->totalNormalized],
                ['RUTs con DV inválido (Módulo 11)', $this->totalInvalid],
                ['Errores inesperados',             $this->totalErrors],
            ]
        );

        if (!empty($this->invalidSamples)) {
            $this->newLine();
            $this->warn('RUTs con dígito verificador inválido (estos NO se modifican, requieren revisión manual):');
            foreach (array_slice($this->invalidSamples, 0, 15) as $sample) {
                $this->line("  - {$sample}");
            }

            if (count($this->invalidSamples) > 15) {
                $remaining = count($this->invalidSamples) - 15;
                $this->line("  ...y {$remaining} más.");
            }
        }

        if (!$audit && $dryRun && $this->totalNormalized > 0) {
            $this->newLine();
            $this->info("Vuelve a ejecutar sin --dry-run para aplicar las {$this->totalNormalized} normalizaciones.");
        }
    }
}
