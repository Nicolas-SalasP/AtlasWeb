<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CountrySeeder::class,
            RegionSeeder::class,
            CommuneSeeder::class,
            UserSeeder::class,
            BillingProfileSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ServiceSeeder::class,
            OrderSeeder::class,
            TicketSeeder::class,
        ]);
    }
}
