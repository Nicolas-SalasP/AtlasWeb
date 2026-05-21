<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommuneSeeder extends Seeder
{
    public function run(): void
    {
        $regions = DB::table('regions')->pluck('id', 'name');

        if ($regions->isEmpty()) {
            return;
        }

        $communes = [
            'Metropolitana de Santiago' => [
                ['name' => 'Santiago Centro', 'shipping_cost' => 3000],
                ['name' => 'Providencia',     'shipping_cost' => 3500],
                ['name' => 'Las Condes',      'shipping_cost' => 4500],
                ['name' => 'Vitacura',        'shipping_cost' => 4500],
                ['name' => 'Lo Barnechea',    'shipping_cost' => 5500],
                ['name' => 'Ñuñoa',           'shipping_cost' => 3500],
                ['name' => 'La Reina',        'shipping_cost' => 4000],
                ['name' => 'Macul',           'shipping_cost' => 3500],
                ['name' => 'San Miguel',      'shipping_cost' => 3500],
                ['name' => 'La Florida',      'shipping_cost' => 4000],
                ['name' => 'Puente Alto',     'shipping_cost' => 4500],
                ['name' => 'Maipú',           'shipping_cost' => 4000],
                ['name' => 'Pudahuel',        'shipping_cost' => 3500],
                ['name' => 'Quilicura',       'shipping_cost' => 4000],
                ['name' => 'Estación Central','shipping_cost' => 3000],
                ['name' => 'San Bernardo',    'shipping_cost' => 5000],
            ],
            'Valparaíso' => [
                ['name' => 'Valparaíso',      'shipping_cost' => 5500],
                ['name' => 'Viña del Mar',    'shipping_cost' => 5500],
                ['name' => 'Quilpué',         'shipping_cost' => 6000],
                ['name' => 'Concón',          'shipping_cost' => 6000],
            ],
            'Biobío' => [
                ['name' => 'Concepción',      'shipping_cost' => 7500],
                ['name' => 'Talcahuano',      'shipping_cost' => 7500],
            ],
            'La Araucanía' => [
                ['name' => 'Temuco',          'shipping_cost' => 8500],
            ],
            'Los Lagos' => [
                ['name' => 'Puerto Montt',    'shipping_cost' => 10500],
                ['name' => 'Osorno',          'shipping_cost' => 10500],
            ],
            'Antofagasta' => [
                ['name' => 'Antofagasta',     'shipping_cost' => 9500],
            ],
            'Coquimbo' => [
                ['name' => 'La Serena',       'shipping_cost' => 7500],
                ['name' => 'Coquimbo',        'shipping_cost' => 7500],
            ],
            'Maule' => [
                ['name' => 'Talca',           'shipping_cost' => 6500],
            ],
            'Magallanes y de la Antártica Chilena' => [
                ['name' => 'Punta Arenas',    'shipping_cost' => 15500],
            ],
        ];

        foreach ($communes as $regionName => $regionCommunes) {
            $regionId = $regions[$regionName] ?? null;
            if (!$regionId) {
                continue;
            }

            foreach ($regionCommunes as $commune) {
                DB::table('communes')->updateOrInsert(
                    [
                        'region_id' => $regionId,
                        'name'      => $commune['name'],
                    ],
                    [
                        'shipping_cost' => $commune['shipping_cost'],
                        'is_servicable' => true,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]
                );
            }
        }
    }
}
