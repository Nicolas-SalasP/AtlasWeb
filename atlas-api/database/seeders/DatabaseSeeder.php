<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
// Importamos todos los Modelos
use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Ticket;
use App\Models\TicketMessage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------------------------------------------------
        // 1. GEOGRAFÍA (Usamos DB::table porque son datos maestros)
        // ---------------------------------------------------
        $chileId = DB::table('countries')->insertGetId([
            'name' => 'Chile', 
            'iso_code' => 'CL', 
            'phone_code' => '+56',
            'created_at' => now(), 'updated_at' => now()
        ]);

        $rmId = DB::table('regions')->insertGetId([
            'country_id' => $chileId, 
            'name' => 'Región Metropolitana', 
            'roman_number' => 'RM',
            'created_at' => now(), 'updated_at' => now()
        ]);

        // Comunas estratégicas para tu logística
        DB::table('communes')->insert([
            ['region_id' => $rmId, 'name' => 'Pudahuel', 'shipping_cost' => 3500, 'created_at' => now(), 'updated_at' => now()],
            ['region_id' => $rmId, 'name' => 'Santiago Centro', 'shipping_cost' => 3000, 'created_at' => now(), 'updated_at' => now()],
            ['region_id' => $rmId, 'name' => 'Las Condes', 'shipping_cost' => 4500, 'created_at' => now(), 'updated_at' => now()],
            ['region_id' => $rmId, 'name' => 'Providencia', 'shipping_cost' => 4000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---------------------------------------------------
        // 2. ROLES DE SISTEMA
        // ---------------------------------------------------
        $roleAdmin = Role::create([
            'name' => 'admin', 
            'permissions' => ['all' => true] // JSON automático gracias al cast en el Modelo
        ]);
        
        $roleClient = Role::create([
            'name' => 'client', 
            'permissions' => ['buy' => true, 'open_ticket' => true]
        ]);

        // ---------------------------------------------------
        // 3. USUARIOS (Tú y tus Clientes Reales)
        // ---------------------------------------------------
        
        // ADMIN: Nicolas Salas
        $admin = User::create([
            'role_id' => $roleAdmin->id,
            'name' => 'Nicolas Salas',
            'email' => 'nicolas@atlas.cl',
            'password' => Hash::make('password'), // Recuerda cambiar esto en producción
            'company_name' => 'Atlas Digital Tech',
            'avatar' => 'https://ui-avatars.com/api/?name=Nicolas+Salas&background=0F172A&color=fff&bold=true'
        ]);

        // CLIENTE: Insuban
        $client1 = User::create([
            'role_id' => $roleClient->id,
            'name' => 'Insuban Ltda',
            'email' => 'contacto@insuban.cl',
            'password' => Hash::make('password'),
            'company_name' => 'Insuban',
            'avatar' => 'https://ui-avatars.com/api/?name=Insuban&background=2563EB&color=fff&bold=true'
        ]);

        // CLIENTE: Tsuki Ink Store
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
        $catServicios = Category::create(['name' => 'Servicios TI', 'slug' => 'servicios-ti', 'is_active' => true]);

        // ---------------------------------------------------
        // 5. PRODUCTOS (Inventario Real)
        // ---------------------------------------------------
        
        // Producto 1: Cámaras Hilook
        $prod1 = Product::create([
            'sku' => 'CAM-HL-004',
            'name' => 'Kit 4 Cámaras Hilook 1080p + DVR',
            'slug' => 'kit-4-camaras-hilook',
            'description' => 'Solución completa de seguridad. Incluye DVR de 4 canales, 4 cámaras bala resistentes a la intemperie y cables.',
            'price' => 149990,
            'stock_current' => 8,
            'category_id' => $catSeguridad->id,
            'is_visible' => true
        ]);
        
        // Usamos el nuevo modelo ProductImage
        ProductImage::create([
            'product_id' => $prod1->id, 
            'url' => 'https://images.unsplash.com/photo-1557324232-b8917d3c3d63?q=80&w=1000&auto=format&fit=crop', 
            'is_cover' => true
        ]);

        // Producto 2: Router MikroTik
        $prod2 = Product::create([
            'sku' => 'MK-HAP-AC3',
            'name' => 'Router MikroTik hAP ac3',
            'slug' => 'router-mikrotik-hap-ac3',
            'description' => 'Router Gigabit de doble banda con 5 puertos Ethernet y soporte para antenas externas de alta ganancia.',
            'price' => 65990,
            'stock_current' => 12,
            'category_id' => $catRedes->id,
            'is_visible' => true
        ]);

        ProductImage::create([
            'product_id' => $prod2->id, 
            'url' => 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=1000&auto=format&fit=crop', 
            'is_cover' => true
        ]);

        // ---------------------------------------------------
        // 6. SOPORTE (Tickets y Mensajes)
        // ---------------------------------------------------

        // Ticket 1: Insuban (Web)
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
            'message' => 'Al intentar exportar el PDF del balance contable, el sistema lanza un error 500.',
            'attachments' => [] 
        ]);

        // Ticket 2: Tsuki Ink (Facturación)
        $ticket2 = Ticket::create([
            'ticket_code' => 'TK-1024',
            'user_id' => $client2->id,
            'subject' => 'Consulta Facturación Enero',
            'category' => 'Facturacion',
            'priority' => 'baja',
            'status' => 'cerrado'
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket2->id,
            'user_id' => $client2->id,
            'message' => 'Hola Nicolas, necesito la factura del mes pasado.'
        ]);
        
        // Respuesta del Admin (Tú)
        TicketMessage::create([
            'ticket_id' => $ticket2->id,
            'user_id' => $admin->id,
            'message' => 'Hola! Te la acabo de enviar a tu correo. Saludos.'
        ]);
    }
}