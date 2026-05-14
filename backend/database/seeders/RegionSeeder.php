<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $chile = DB::table('countries')->where('iso_code', 'CL')->first();

        if (!$chile) {
            return;
        }

        $regions = [
            ['name' => 'Arica y Parinacota',          'roman_number' => 'XV'],
            ['name' => 'Tarapacá',                    'roman_number' => 'I'],
            ['name' => 'Antofagasta',                 'roman_number' => 'II'],
            ['name' => 'Atacama',                     'roman_number' => 'III'],
            ['name' => 'Coquimbo',                    'roman_number' => 'IV'],
            ['name' => 'Valparaíso',                  'roman_number' => 'V'],
            ['name' => 'Metropolitana de Santiago',   'roman_number' => 'RM'],
            ['name' => 'Libertador General Bernardo O\'Higgins', 'roman_number' => 'VI'],
            ['name' => 'Maule',                       'roman_number' => 'VII'],
            ['name' => 'Ñuble',                       'roman_number' => 'XVI'],
            ['name' => 'Biobío',                      'roman_number' => 'VIII'],
            ['name' => 'La Araucanía',                'roman_number' => 'IX'],
            ['name' => 'Los Ríos',                    'roman_number' => 'XIV'],
            ['name' => 'Los Lagos',                   'roman_number' => 'X'],
            ['name' => 'Aysén del General Carlos Ibáñez del Campo', 'roman_number' => 'XI'],
            ['name' => 'Magallanes y de la Antártica Chilena',      'roman_number' => 'XII'],
        ];

        foreach ($regions as $region) {
            DB::table('regions')->updateOrInsert(
                [
                    'country_id' => $chile->id,
                    'name'       => $region['name'],
                ],
                [
                    'roman_number' => $region['roman_number'],
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]
            );
        }
    }
}
