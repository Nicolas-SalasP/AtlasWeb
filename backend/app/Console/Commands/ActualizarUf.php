<?php

namespace App\Console\Commands;

use App\Domain\System\Services\UfService;
use Illuminate\Console\Command;

class ActualizarUf extends Command
{
    protected $signature   = 'uf:actualizar';
    protected $description = 'Refresca el valor de la UF desde mindicador.cl y actualiza el caché';

    public function __construct(private readonly UfService $ufService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Obteniendo UF desde mindicador.cl...');

        $valor = $this->ufService->refrescar();

        $this->info(sprintf(
            'UF actualizada: $%s',
            number_format($valor, 2, ',', '.')
        ));

        return self::SUCCESS;
    }
}
