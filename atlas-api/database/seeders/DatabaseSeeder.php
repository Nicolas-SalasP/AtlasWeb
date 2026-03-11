<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Order;
use App\Models\OrderItem;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ---------------------------------------------------
        // 1. GEOGRAFÍA
        // ---------------------------------------------------
        $chileId = DB::table('countries')->insertGetId([
            'name' => 'Chile',
            'iso_code' => 'CL',
            'phone_code' => '+56',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $rmId = DB::table('regions')->insertGetId([
            'country_id' => $chileId,
            'name' => 'Región Metropolitana',
            'roman_number' => 'RM',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('communes')->insert([
            ['region_id' => $rmId, 'name' => 'Pudahuel', 'shipping_cost' => 3500, 'created_at' => now(), 'updated_at' => now()],
            ['region_id' => $rmId, 'name' => 'Santiago Centro', 'shipping_cost' => 3000, 'created_at' => now(), 'updated_at' => now()],
            ['region_id' => $rmId, 'name' => 'Las Condes', 'shipping_cost' => 4500, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---------------------------------------------------
        // 2. ROLES
        // ---------------------------------------------------
        // Rol ID 1: Admin, Rol ID 2: Cliente
        $roleAdmin = Role::create(['name' => 'admin', 'permissions' => json_encode(['all' => true])]);
        $roleClient = Role::create(['name' => 'client', 'permissions' => json_encode(['buy' => true, 'open_ticket' => true])]);

        // ---------------------------------------------------
        // 3. USUARIOS
        // ---------------------------------------------------
        $admin = User::create([
            'role_id' => $roleAdmin->id,
            'name' => 'Nicolás Salas',
            'rut' => '11.111.111-1',
            'email' => 'nicolas@atlas.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Atlas Digital Tech',
            'avatar' => 'https://ui-avatars.com/api/?name=Nicolas+Salas&background=0F172A&color=fff&bold=true'
        ]);

        $client1 = User::create([
            'role_id' => $roleClient->id,
            'name' => 'Procesadora Insuban Spa',
            'rut' => '78.730.890-2',
            'email' => 'contacto@insuban.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Insuban',
            'avatar' => 'https://ui-avatars.com/api/?name=Insuban&background=2563EB&color=fff&bold=true'
        ]);

        $client2 = User::create([
            'role_id' => $roleClient->id,
            'name' => 'Tsuki Ink',
            'rut' => '33.333.333-3',
            'email' => 'ventas@tsuki.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Tsuki Ink Store',
            'avatar' => 'https://ui-avatars.com/api/?name=Tsuki+Ink&background=DB2777&color=fff&bold=true'
        ]);

        // ---------------------------------------------------
        // 4. CATEGORÍAS
        // ---------------------------------------------------
        $catSeguridad = Category::create(['name' => 'Seguridad', 'slug' => 'seguridad', 'is_active' => true]);
        $catRedes = Category::create(['name' => 'Redes y Conectividad', 'slug' => 'redes', 'is_active' => true]);

        // ---------------------------------------------------
        // 5. PRODUCTOS
        // ---------------------------------------------------
        $prod1 = Product::create([
            'sku' => 'CAM-HL-004',
            'name' => 'Kit 4 Cámaras Hilook 1080p + DVR',
            'slug' => 'kit-4-camaras-hilook',
            'description' => 'Solución completa de seguridad para tu hogar o empresa.',
            'price' => 149990,
            'stock_current' => 8,
            'category_id' => $catSeguridad->id,
            'is_visible' => true
        ]);
        ProductImage::create(['product_id' => $prod1->id, 'url' => '/storage/products/camara.jpg', 'is_cover' => true]);

        $prod2 = Product::create([
            'sku' => 'MK-HAP-AC3',
            'name' => 'Router MikroTik hAP ac3',
            'slug' => 'router-mikrotik-hap-ac3',
            'description' => 'Router Gigabit de doble banda con antenas externas.',
            'price' => 65990,
            'stock_current' => 12,
            'category_id' => $catRedes->id,
            'is_visible' => true
        ]);
        ProductImage::create(['product_id' => $prod2->id, 'url' => '/storage/products/router.jpg', 'is_cover' => true]);

        // ---------------------------------------------------
        // 6. ÓRDENES (Generación de Historial)
        // ---------------------------------------------------
        $clientes = [$client1, $client2];
        $productosDisponibles = [$prod1, $prod2];

        foreach ($clientes as $cliente) {
            for ($i = 1; $i <= 2; $i++) {
                $shipping = 4500;

                $order = Order::create([
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'user_id' => $cliente->id,
                    'address_id' => null,
                    'subtotal' => 0,
                    'shipping_cost' => $shipping,
                    'total' => 0,
                    'status' => 'paid',
                    'customer_data' => json_encode([
                        'nombre' => $cliente->name,
                        'email' => $cliente->email,
                        'rut' => $cliente->rut
                    ]),
                    'created_at' => now()->subDays(rand(1, 30))
                ]);

                $prodElegido = $productosDisponibles[array_rand($productosDisponibles)];
                $cantidad = rand(1, 2);
                $totalLinea = $prodElegido->price * $cantidad;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $prodElegido->id,
                    'product_name' => $prodElegido->name,
                    'sku_snapshot' => $prodElegido->sku,
                    'quantity' => $cantidad,
                    'unit_price' => $prodElegido->price,
                    'total_line' => $totalLinea
                ]);

                $order->update([
                    'subtotal' => $totalLinea,
                    'total' => $totalLinea + $shipping
                ]);
            }
        }

        // ---------------------------------------------------
        // 7. SOPORTE (Tickets y Mensajes)
        // ---------------------------------------------------
        $ticket1 = Ticket::create([
            'ticket_code' => 'TK-1025',
            'user_id' => $client1->id,
            'subject' => 'Error al generar reporte mensual',
            'category' => 'ERP',
            'priority' => 'alta',
            'status' => 'nuevo'
        ]);
        TicketMessage::create([
            'ticket_id' => $ticket1->id, 
            'user_id' => $client1->id, 
            'message' => 'El sistema lanza error 500 al intentar exportar el PDF.', 
            'attachments' => json_encode([])
        ]);

        $ticket2 = Ticket::create([
            'ticket_code' => 'TK-1024',
            'user_id' => $client2->id,
            'subject' => 'Consulta Facturación',
            'category' => 'Facturacion',
            'priority' => 'baja',
            'status' => 'cerrado'
        ]);
        TicketMessage::create(['ticket_id' => $ticket2->id, 'user_id' => $client2->id, 'message' => '¿Cuándo envían la factura del router?']);
        TicketMessage::create(['ticket_id' => $ticket2->id, 'user_id' => $admin->id, 'message' => 'Hola, la factura ya fue enviada a tu correo registrado. Saludos.']);
    }
}