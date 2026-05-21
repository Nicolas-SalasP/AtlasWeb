<?php

namespace Database\Seeders;

use App\Domain\Product\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Seguridad',             'slug' => 'seguridad'],
            ['name' => 'Cámaras IP',            'slug' => 'camaras-ip'],
            ['name' => 'Redes y Conectividad', 'slug' => 'redes'],
            ['name' => 'Cables y Accesorios',  'slug' => 'cables'],
            ['name' => 'Audio Profesional',    'slug' => 'audio'],
            ['name' => 'Insumos Tatuaje',      'slug' => 'tatuaje'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'name'      => $data['name'],
                    'is_active' => true,
                ]
            );
        }
    }
}
