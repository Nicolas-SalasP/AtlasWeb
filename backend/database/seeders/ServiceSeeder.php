<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Service;
use App\Domain\System\Services\UfService;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $uf = app(UfService::class);

        $planes = [
            [
                'name' => 'ERP Starter',
                'slug' => 'erp-starter',
                'description' => 'Para emprendedores y micro-PYMEs que recién empiezan a ordenar su negocio. Ideal para validar tu empresa sin pagar nada.',
                'uf' => 0,
                'price_label' => 'Gratis',
                'is_popular' => false,
                'features' => [
                    'Dashboard con métricas principales',
                    'Gestión de Clientes',
                    'Cotizaciones profesionales (PDF)',
                    'Registro manual de facturas (carga desde SII)',
                    'Perfil de empresa',
                    'Glosario contable',
                    '1 usuario',
                    '1 empresa',
                    '1 GB de almacenamiento',
                    'Soporte: Documentación',
                ],
            ],
            [
                'name' => 'ERP Pyme Esencial',
                'slug' => 'erp-pyme-esencial',
                'description' => 'Tu primera contabilidad de verdad. Para PYMEs que ya facturan en serio. Incluye emisión DTE y módulos contables completos.',
                'uf' => 2.0,
                'price_label' => '2.0 UF/mes',
                'is_popular' => false,
                'features' => [
                    'Todo lo del plan Starter',
                    'Emisión DTE (200 documentos/mes)',
                    'Plan de Cuentas',
                    'Libro Mayor',
                    'Asientos Manuales',
                    'Historial de Facturas',
                    'Visor de Asientos',
                    'Auditoría de Facturas',
                    'Anulación de Documentos',
                    '3 usuarios',
                    '1 empresa',
                    '10 GB de almacenamiento',
                    'Backups diarios',
                    'Soporte: Email < 24h',
                ],
            ],
            [
                'name' => 'ERP Pyme Profesional',
                'slug' => 'erp-pyme-profesional',
                'description' => 'El plan estrella. Para PYMEs en crecimiento con operación real. Incluye banco, conciliación, inventario y gestión de usuarios.',
                'uf' => 3.5,
                'price_label' => '3.5 UF/mes',
                'is_popular' => true,
                'features' => [
                    'Todo lo del plan Esencial',
                    'Proveedores (gestión + visor 360°)',
                    'Cartola Bancaria',
                    'Mesa de Conciliación',
                    'Nómina de Pagos',
                    'Inventario básico (productos)',
                    'Bodegas y Movimientos',
                    'Gestión de Usuarios',
                    'Gestión de Roles',
                    'Emisión DTE (800 documentos/mes)',
                    '7 usuarios',
                    '2 empresas',
                    '50 GB de almacenamiento',
                    'Backups diarios',
                    'Soporte: Email < 12h',
                ],
            ],
            [
                'name' => 'ERP Pyme Avanzada',
                'slug' => 'erp-pyme-avanzada',
                'description' => 'Para empresas medianas con todas las necesidades cubiertas. Todo el catálogo sin add-ons: inventario avanzado, activos fijos y tributario completo.',
                'uf' => 6.0,
                'price_label' => '6.0 UF/mes',
                'is_popular' => false,
                'features' => [
                    'Todo lo del plan Profesional',
                    'Inventario avanzado (Kardex, Lotes, Reservas, Valorización, Tomas físicas)',
                    'Activos Fijos (gestión completa, depreciaciones, proyectos)',
                    'Tributario completo (Renta, Mapeo SII, Cierre F29 automático)',
                    'Reclasificador (Workbench intra-asiento)',
                    'Emisión DTE (3.000 documentos/mes)',
                    '15 usuarios',
                    '5 empresas',
                    '200 GB de almacenamiento',
                    'Backups diarios + restore',
                    'Soporte: Email < 4h + chat',
                ],
            ],
            [
                'name' => 'ERP Enterprise',
                'slug' => 'erp-enterprise',
                'description' => 'Para empresas medianas-grandes con necesidades específicas y personalización. Usuarios ilimitados, integraciones API, SLA garantizado y account manager dedicado.',
                'uf' => 10.0,
                'price_label' => 'Desde 10 UF/mes',
                'is_popular' => false,
                'features' => [
                    'Todo lo del plan Avanzada',
                    'Usuarios ilimitados',
                    'Empresas ilimitadas',
                    'DTE ilimitados',
                    'Integraciones API (banco, POS, CRM)',
                    'Dashboard ejecutivo a medida',
                    'Módulos custom on-demand',
                    'White-label opcional',
                    'SLA garantizado 99.5–99.9%',
                    'Soporte 24/7 telefónico',
                    'Account manager dedicado',
                    'Onboarding completo en sitio',
                    'Almacenamiento ilimitado',
                    'Precio por cotización individual',
                ],
            ],
        ];

        foreach ($planes as $plan) {
            Service::firstOrCreate(
                ['name' => $plan['name']],
                [
                    'slug' => $plan['slug'],
                    'description' => $plan['description'],
                    'price' => $plan['uf'] > 0 ? $uf->clpDesdeUf($plan['uf']) : 0,
                    'price_uf' => (string) $plan['uf'],
                    'price_label' => $plan['price_label'],
                    'duration_days' => 30,
                    'features' => $plan['features'],
                    'is_popular' => $plan['is_popular'],
                    'is_active' => true,
                    'image_url' => null,
                ]
            );
        }
    }
}
