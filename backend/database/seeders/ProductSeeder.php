<?php

namespace Database\Seeders;

use App\Domain\Product\Models\Category;
use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'sku'         => 'CAM-HL-004',
                'name'        => 'Kit 4 Cámaras Hilook 1080p + DVR',
                'slug'        => 'kit-4-camaras-hilook-1080p-dvr',
                'description' => 'Solución completa de seguridad para hogar o pequeño negocio. Incluye DVR, 4 cámaras 1080p, fuente y cables.',
                'specs'       => [
                    'Resolución' => '1080p Full HD',
                    'Canales'    => 4,
                    'Garantía'   => '12 meses',
                    'Visión nocturna' => 'Sí, hasta 20m',
                ],
                'price'         => 149990,
                'cost_price'    => 95000,
                'stock_current' => 8,
                'stock_alert'   => 3,
                'category_slug' => 'seguridad',
                'image_url'     => '/storage/products/demo-camara-kit.jpg',
            ],
            [
                'sku'         => 'CAM-IP-DOME',
                'name'        => 'Cámara IP Domo 2MP PoE',
                'slug'        => 'camara-ip-domo-2mp-poe',
                'description' => 'Cámara IP domo con visión nocturna, ideal para interior. Alimentación PoE.',
                'specs'       => [
                    'Resolución'  => '2MP',
                    'Protocolo'   => 'ONVIF',
                    'Alimentación'=> 'PoE 802.3af',
                ],
                'price'         => 45990,
                'cost_price'    => 28000,
                'stock_current' => 25,
                'stock_alert'   => 5,
                'category_slug' => 'camaras-ip',
                'image_url'     => '/storage/products/demo-camara-domo.jpg',
            ],
            [
                'sku'         => 'MK-HAP-AC3',
                'name'        => 'Router MikroTik hAP ac3',
                'slug'        => 'router-mikrotik-hap-ac3',
                'description' => 'Router doble banda con antenas externas y procesador de 4 núcleos.',
                'specs'       => [
                    'WiFi'      => '802.11ac dual-band',
                    'Puertos'   => '5 Gigabit + 1 SFP',
                    'CPU'       => 'IPQ-4019 4-core',
                ],
                'price'         => 65990,
                'cost_price'    => 42000,
                'stock_current' => 12,
                'stock_alert'   => 4,
                'category_slug' => 'redes',
                'image_url'     => '/storage/products/demo-router-mikrotik.jpg',
            ],
            [
                'sku'         => 'CBL-UTP-CAT6',
                'name'        => 'Bobina Cable UTP CAT6 305m',
                'slug'        => 'bobina-cable-utp-cat6-305m',
                'description' => 'Bobina de cable UTP CAT6 305 metros para instalaciones de red.',
                'specs'       => [
                    'Categoría' => 'CAT6',
                    'Largo'     => '305m',
                    'Conductor' => 'Cobre 23 AWG',
                ],
                'price'         => 89990,
                'cost_price'    => 55000,
                'stock_current' => 6,
                'stock_alert'   => 2,
                'category_slug' => 'cables',
                'image_url'     => '/storage/products/demo-cable-utp.jpg',
            ],
            [
                'sku'         => 'AUD-MIC-SM58',
                'name'        => 'Micrófono Shure SM58',
                'slug'        => 'microfono-shure-sm58',
                'description' => 'Micrófono dinámico cardioide ideal para voces en vivo.',
                'specs'       => [
                    'Tipo'      => 'Dinámico',
                    'Patrón'    => 'Cardioide',
                    'Conector'  => 'XLR',
                ],
                'price'         => 119990,
                'cost_price'    => 78000,
                'stock_current' => 4,
                'stock_alert'   => 2,
                'category_slug' => 'audio',
                'image_url'     => '/storage/products/demo-shure-sm58.jpg',
            ],
            [
                'sku'         => 'TAT-INK-BLK',
                'name'        => 'Tinta Tatuaje Negra Premium 30ml',
                'slug'        => 'tinta-tatuaje-negra-premium-30ml',
                'description' => 'Tinta de tatuaje negra de alta pigmentación, vegana, 30ml.',
                'specs'       => [
                    'Volumen'    => '30 ml',
                    'Color'      => 'Negro',
                    'Vegana'     => 'Sí',
                ],
                'price'         => 12990,
                'cost_price'    => 6000,
                'stock_current' => 50,
                'stock_alert'   => 10,
                'category_slug' => 'tatuaje',
                'image_url'     => '/storage/products/demo-tinta-tatuaje.jpg',
            ],
        ];

        foreach ($products as $data) {
            $category = Category::where('slug', $data['category_slug'])->first();
            if (!$category) {
                continue;
            }

            $product = Product::firstOrCreate(
                ['sku' => $data['sku']],
                [
                    'name'          => $data['name'],
                    'slug'          => $data['slug'],
                    'description'   => $data['description'],
                    'specs'         => $data['specs'],
                    'price'         => $data['price'],
                    'cost_price'    => $data['cost_price'],
                    'stock_current' => $data['stock_current'],
                    'stock_alert'   => $data['stock_alert'],
                    'category_id'   => $category->id,
                    'is_visible'    => true,
                ]
            );

            if ($product->wasRecentlyCreated) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => $data['image_url'],
                    'position'   => 0,
                    'is_cover'   => true,
                ]);
            }
        }
    }
}
