<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Necesario para generar códigos de orden

// Importamos todos los Modelos
use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Order;      // <--- NUEVO
use App\Models\OrderItem;  // <--- NUEVO

class DatabaseSeeder extends Seeder
{
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
        $roleAdmin = Role::create(['name' => 'admin', 'permissions' => ['all' => true]]);
        $roleClient = Role::create(['name' => 'client', 'permissions' => ['buy' => true, 'open_ticket' => true]]);

        // ---------------------------------------------------
        // 3. USUARIOS
        // ---------------------------------------------------
        $admin = User::create([
            'role_id' => $roleAdmin->id,
            'name' => 'Nicolas Salas',
            'email' => 'nicolas@atlas.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Atlas Digital Tech',
            'avatar' => 'https://ui-avatars.com/api/?name=Nicolas+Salas&background=0F172A&color=fff&bold=true'
        ]);

        $client1 = User::create([
            'role_id' => $roleClient->id,
            'name' => 'Insuban Ltda',
            'email' => 'contacto@insuban.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Insuban',
            'avatar' => 'https://ui-avatars.com/api/?name=Insuban&background=2563EB&color=fff&bold=true'
        ]);

        $client2 = User::create([
            'role_id' => $roleClient->id,
            'name' => 'Tsuki Ink',
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
            'description' => 'Solución completa de seguridad.',
            'price' => 149990,
            'stock_current' => 8,
            'category_id' => $catSeguridad->id,
            'is_visible' => true
        ]);
        ProductImage::create(['product_id' => $prod1->id, 'url' => 'https://images.unsplash.com/photo-1557324232-b8917d3c3d63?q=80&w=1000&auto=format&fit=crop', 'is_cover' => true]);

        $prod2 = Product::create([
            'sku' => 'MK-HAP-AC3',
            'name' => 'Router MikroTik hAP ac3',
            'slug' => 'router-mikrotik-hap-ac3',
            'description' => 'Router Gigabit de doble banda.',
            'price' => 65990,
            'stock_current' => 12,
            'category_id' => $catRedes->id,
            'is_visible' => true
        ]);
        ProductImage::create(['product_id' => $prod2->id, 'url' => 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=1000&auto=format&fit=crop', 'is_cover' => true]);

        // ---------------------------------------------------
        // 6. ÓRDENES (COMPRAS REALES) <--- AQUÍ ESTÁ LA MAGIA NUEVA
        // ---------------------------------------------------

        $clientes = [$client1, $client2];
        $productosDisponibles = [$prod1, $prod2];

        foreach ($clientes as $cliente) {
            // Creamos 2 órdenes por cliente
            for ($i = 1; $i <= 2; $i++) {
                $subtotal = 0;
                $shipping = 4500;

                // 1. Crear Orden Cabecera
                $order = Order::create([
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'user_id' => $cliente->id,
                    'address_id' => null, // Opcional por ahora
                    'subtotal' => 0, // Calculamos abajo
                    'shipping_cost' => $shipping,
                    'total' => 0, // Calculamos abajo
                    'status' => 'paid', // 'paid', 'pending', etc.
                    'created_at' => now()->subDays(rand(1, 30)) // Fechas pasadas
                ]);

                // 2. Crear Items
                // Elegimos un producto al azar
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

                $subtotal += $totalLinea;

                // 3. Actualizar Totales
                $order->update([
                    'subtotal' => $subtotal,
                    'total' => $subtotal + $shipping
                ]);
            }
        }

        // ---------------------------------------------------
        // 7. SOPORTE (Tickets)
        // ---------------------------------------------------
        $ticket1 = Ticket::create([
            'ticket_code' => 'TK-1025',
            'user_id' => $client1->id,
            'subject' => 'Error al generar reporte mensual',
            'category' => 'ERP',
            'priority' => 'alta',
            'status' => 'nuevo'
        ]);
        TicketMessage::create(['ticket_id' => $ticket1->id, 'user_id' => $client1->id, 'message' => 'El sistema lanza error 500.', 'attachments' => []]);

        $ticket2 = Ticket::create([
            'ticket_code' => 'TK-1024',
            'user_id' => $client2->id,
            'subject' => 'Consulta Facturación',
            'category' => 'Facturacion',
            'priority' => 'baja',
            'status' => 'cerrado'
        ]);
        TicketMessage::create(['ticket_id' => $ticket2->id, 'user_id' => $client2->id, 'message' => 'Necesito la factura.']);
        TicketMessage::create(['ticket_id' => $ticket2->id, 'user_id' => $admin->id, 'message' => 'Enviada.']);
    }
}