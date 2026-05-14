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
                'name'          => 'Plan Mantención Mensual',
                'description'   => 'Mantención preventiva mensual de equipos de seguridad y red. Incluye revisión remota, actualización de firmware y soporte prioritario.',
                'price'         => 29990,
                'duration_days' => 30,
                'features'      => [
                    'Revisión remota mensual',
                    'Soporte prioritario por correo',
                    'Actualización de firmware',
                ],
                'image_url'     => '/storage/services/demo-plan-mensual.jpg',
            ],
            [
                'name'          => 'Plan Mantención Semestral',
                'description'   => 'Plan de 6 meses con visita técnica presencial cuatrimestral y soporte ilimitado.',
                'price'         => 159990,
                'duration_days' => 180,
                'features'      => [
                    'Todo el plan mensual',
                    'Visita técnica presencial cada 4 meses',
                    'Soporte ilimitado por correo y teléfono',
                    'Descuento 15% en productos',
                ],
                'image_url'     => '/storage/services/demo-plan-semestral.jpg',
            ],
            [
                'name'          => 'Plan Mantención Anual Premium',
                'description'   => 'Plan completo de 12 meses para empresas: visitas mensuales, soporte 24/7 y reemplazo de equipos.',
                'price'         => 299990,
                'duration_days' => 365,
                'features'      => [
                    'Todo el plan semestral',
                    'Visita técnica presencial mensual',
                    'Soporte 24/7',
                    'Reemplazo de equipos durante 12 meses',
                    'Descuento 25% en productos',
                ],
                'image_url'     => '/storage/services/demo-plan-anual.jpg',
            ],
        ];

        foreach ($services as $data) {
            Service::firstOrCreate(
                ['name' => $data['name']],
                [
                    'description'   => $data['description'],
                    'price'         => $data['price'],
                    'duration_days' => $data['duration_days'],
                    'features'      => $data['features'],
                    'image_url'     => $data['image_url'],
                    'is_active'     => true,
                ]
            );
        }
    }
}
