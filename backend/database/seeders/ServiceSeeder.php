<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'ERP Starter',
                'slug' => 'erp-starter',
                'description' => 'Para emprendedores y micro-PYMEs que recién empiezan a ordenar su negocio. Ideal para validar tu empresa sin pagar nada.',
                'price' => 0,
                'duration_days' => 30,
                'is_popular' => false,
                'price_uf' => '0',
                'price_label' => 'Gratis',
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
                'image_url' => null,
            ],
            [
                'name' => 'ERP Pyme Esencial',
                'slug' => 'erp-pyme-esencial',
                'description' => 'Tu primera contabilidad de verdad. Para PYMEs que ya facturan en serio. Incluye emisión DTE y módulos contables completos.',
                'price' => 80614,
                'duration_days' => 30,
                'is_popular' => false,
                'price_uf' => '2.0',
                'price_label' => '2.0 UF/mes',
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
                'image_url' => null,
            ],
            [
                'name' => 'ERP Pyme Profesional',
                'slug' => 'erp-pyme-profesional',
                'description' => 'El plan estrella. Para PYMEs en crecimiento con operación real. Incluye banco, conciliación, inventario y gestión de usuarios.',
                'price' => 141075,
                'duration_days' => 30,
                'is_popular' => true,
                'price_uf' => '3.5',
                'price_label' => '3.5 UF/mes',
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
                'image_url' => null,
            ],
            [
                'name' => 'ERP Pyme Avanzada',
                'slug' => 'erp-pyme-avanzada',
                'description' => 'Para empresas medianas con todas las necesidades cubiertas. Todo el catálogo sin add-ons: inventario avanzado, activos fijos y tributario completo.',
                'price' => 241842,
                'duration_days' => 30,
                'is_popular' => false,
                'price_uf' => '6.0',
                'price_label' => '6.0 UF/mes',
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
                'image_url' => null,
            ],
            [
                'name' => 'ERP Enterprise',
                'slug' => 'erp-enterprise',
                'description' => 'Para empresas medianas-grandes con necesidades específicas y personalización. Usuarios ilimitados, integraciones API, SLA garantizado y account manager dedicado.',
                'price' => 403070,
                'duration_days' => 30,
                'is_popular' => false,
                'price_uf' => '10+',
                'price_label' => 'Desde 10 UF/mes',
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
                'image_url' => null,
            ],
        ];

        foreach ($services as $data) {
            Service::firstOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'duration_days' => $data['duration_days'],
                    'features' => $data['features'],
                    'image_url' => $data['image_url'],
                    'is_active' => true,
                ]
            );
        }
    }
}
