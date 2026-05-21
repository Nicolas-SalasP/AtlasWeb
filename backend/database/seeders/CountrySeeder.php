<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['name' => 'Chile', 'iso_code' => 'CL', 'phone_code' => '+56'],
        ];

        foreach ($countries as $country) {
            DB::table('countries')->updateOrInsert(
                ['iso_code' => $country['iso_code']],
                [
                    'name'       => $country['name'],
                    'phone_code' => $country['phone_code'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
