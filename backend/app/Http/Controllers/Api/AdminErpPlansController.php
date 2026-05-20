<?php

namespace App\Http\Controllers\Api;

use App\Domain\Catalog\Models\Service;
use App\Domain\Erp\Services\ErpClient;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminErpPlansController extends Controller
{
    private const ALL_MODULES = [
        ['key' => 'dashboard',                   'label' => 'Dashboard principal',           'categoria' => 'General'],
        ['key' => 'clientes',                     'label' => 'Clientes y directorio',         'categoria' => 'Comercial'],
        ['key' => 'cotizaciones',                 'label' => 'Cotizaciones',                  'categoria' => 'Comercial'],
        ['key' => 'facturas.manual',              'label' => 'Ingreso de facturas',           'categoria' => 'Compras'],
        ['key' => 'facturas.historial',           'label' => 'Historial de compras',          'categoria' => 'Compras'],
        ['key' => 'facturas.auditoria',           'label' => 'Auditoría de facturas',         'categoria' => 'Compras'],
        ['key' => 'dte.emision',                  'label' => 'Emisión DTE',                   'categoria' => 'Compras'],
        ['key' => 'documentos.anulacion',         'label' => 'Anulación de documentos',       'categoria' => 'Compras'],
        ['key' => 'proveedores',                  'label' => 'Proveedores',                   'categoria' => 'Compras'],
        ['key' => 'tesoreria.cartola',            'label' => 'Cartola bancaria',              'categoria' => 'Tesorería'],
        ['key' => 'tesoreria.conciliacion',       'label' => 'Mesa de conciliación',          'categoria' => 'Tesorería'],
        ['key' => 'tesoreria.nomina',             'label' => 'Nómina de pagos',               'categoria' => 'Tesorería'],
        ['key' => 'contabilidad.plan_cuentas',   'label' => 'Plan de cuentas',               'categoria' => 'Contabilidad'],
        ['key' => 'contabilidad.libro_mayor',    'label' => 'Libro mayor',                   'categoria' => 'Contabilidad'],
        ['key' => 'contabilidad.asientos',       'label' => 'Asientos manuales',             'categoria' => 'Contabilidad'],
        ['key' => 'contabilidad.visor',          'label' => 'Visor de asientos',             'categoria' => 'Contabilidad'],
        ['key' => 'contabilidad.reclasificador', 'label' => 'Reclasificador',                'categoria' => 'Contabilidad'],
        ['key' => 'activos_fijos',               'label' => 'Activos fijos',                 'categoria' => 'Activos'],
        ['key' => 'inventario.productos',        'label' => 'Productos',                     'categoria' => 'Inventario'],
        ['key' => 'inventario.bodegas',          'label' => 'Bodegas',                       'categoria' => 'Inventario'],
        ['key' => 'inventario.movimientos',      'label' => 'Movimientos',                   'categoria' => 'Inventario'],
        ['key' => 'inventario.kardex',           'label' => 'Kardex',                        'categoria' => 'Inventario'],
        ['key' => 'inventario.lotes',            'label' => 'Lotes',                         'categoria' => 'Inventario'],
        ['key' => 'inventario.reservas',         'label' => 'Reservas',                      'categoria' => 'Inventario'],
        ['key' => 'inventario.valorizacion',     'label' => 'Valorización',                  'categoria' => 'Inventario'],
        ['key' => 'inventario.tomas_fisicas',    'label' => 'Tomas físicas',                 'categoria' => 'Inventario'],
        ['key' => 'tributario.renta',            'label' => 'Operación renta',               'categoria' => 'Tributario'],
        ['key' => 'tributario.mapeo_sii',        'label' => 'Mapeo SII',                     'categoria' => 'Tributario'],
        ['key' => 'tributario.f29',              'label' => 'Cierre F29',                    'categoria' => 'Tributario'],
        ['key' => 'usuarios.gestion',            'label' => 'Gestión de usuarios',           'categoria' => 'Administración'],
        ['key' => 'roles.gestion',               'label' => 'Roles y permisos',              'categoria' => 'Administración'],
        ['key' => 'empresa.perfil',              'label' => 'Perfil de empresa',             'categoria' => 'General'],
        ['key' => 'glosario',                    'label' => 'Glosario contable',             'categoria' => 'General'],
        ['key' => 'dashboard.ejecutivo',         'label' => 'Dashboard ejecutivo',           'categoria' => 'General'],
        ['key' => 'integraciones.api',           'label' => 'Integraciones API',             'categoria' => 'Enterprise'],
        ['key' => 'white_label',                 'label' => 'White-label',                   'categoria' => 'Enterprise'],
        ['key' => 'modulos.custom',              'label' => 'Módulos custom',                'categoria' => 'Enterprise'],
    ];

    public function __construct(private readonly ErpClient $erp)
    {
    }

    public function index(): JsonResponse
    {
        $planes = Service::where('slug', 'like', 'erp-%')
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price_label', 'module_keys', 'is_popular']);

        return response()->json([
            'planes'      => $planes,
            'all_modules' => self::ALL_MODULES,
        ]);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        if (!str_starts_with($service->slug ?? '', 'erp-')) {
            return response()->json(['message' => 'Solo se pueden editar planes ERP.'], 422);
        }

        $request->validate([
            'module_keys'   => ['required', 'array'],
            'module_keys.*' => ['string'],
        ]);

        $validKeys = array_column(self::ALL_MODULES, 'key');
        $moduleKeys = array_values(array_filter(
            $request->module_keys,
            fn ($k) => in_array($k, $validKeys, true)
        ));

        $service->update(['module_keys' => $moduleKeys]);

        try {
            $this->erp->syncPlan($service->slug, $moduleKeys);
        } catch (\Throwable $e) {
            Log::warning('AdminErpPlans: no se pudo sincronizar el plan al ERP', [
                'plan_slug' => $service->slug,
                'error'     => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'plan'    => $service->refresh()->only(['id', 'name', 'slug', 'price_label', 'module_keys']),
        ]);
    }

    public function onlineUsers(): JsonResponse
    {
        try {
            $result = $this->erp->onlineUsers();
            return response()->json($result);
        } catch (\Throwable $e) {
            Log::warning('AdminErpPlans: no se pudo obtener usuarios online del ERP', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['paid' => [], 'all' => [], 'error' => true]);
        }
    }
}
