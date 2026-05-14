<?php

namespace Database\Seeders;

use App\Domain\Ticket\Enums\TicketCategory;
use App\Domain\Ticket\Enums\TicketPriority;
use App\Domain\Ticket\Enums\TicketStatus;
use App\Domain\Ticket\Models\Ticket;
use App\Domain\Ticket\Models\TicketMessage;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'nicolas@tenri.cl')->first();
        $insuban = User::where('email', 'contacto@insuban.cl')->first();
        $tsuki = User::where('email', 'ventas@tsuki.cl')->first();

        if (!$admin || !$insuban || !$tsuki) {
            return;
        }

        $tickets = [
            [
                'ticket_code' => 'TK-DEMO01',
                'user'        => $insuban,
                'assigned_to' => null,
                'subject'     => 'Error al generar reporte mensual',
                'category'    => TicketCategory::ERP,
                'priority'    => TicketPriority::Alta,
                'status'      => TicketStatus::Nuevo,
                'days_ago'    => 3,
                'messages'    => [
                    [
                        'author'  => 'user',
                        'message' => 'El sistema lanza error 500 al intentar exportar el PDF de reporte mensual desde el panel de ERP. Adjunto pantallazo al equipo de soporte.',
                    ],
                ],
            ],
            [
                'ticket_code' => 'TK-DEMO02',
                'user'        => $tsuki,
                'assigned_to' => $admin,
                'subject'     => 'Consulta sobre facturación electrónica',
                'category'    => TicketCategory::Facturacion,
                'priority'    => TicketPriority::Baja,
                'status'      => TicketStatus::Cerrado,
                'days_ago'    => 12,
                'messages'    => [
                    [
                        'author'  => 'user',
                        'message' => '¿Cuándo envían la factura electrónica del router que compré la semana pasada?',
                    ],
                    [
                        'author'  => 'admin',
                        'message' => 'Hola, la factura ya fue enviada a tu correo registrado. Si no la recibiste, revisa la carpeta de spam. Saludos.',
                    ],
                    [
                        'author'  => 'user',
                        'message' => 'Perfecto, la encontré en spam. ¡Gracias!',
                    ],
                ],
            ],
            [
                'ticket_code' => 'TK-DEMO03',
                'user'        => $insuban,
                'assigned_to' => $admin,
                'subject'     => 'Problemas de conectividad con router nuevo',
                'category'    => TicketCategory::Soporte,
                'priority'    => TicketPriority::Media,
                'status'      => TicketStatus::EsperandoCliente,
                'days_ago'    => 6,
                'messages'    => [
                    [
                        'author'  => 'user',
                        'message' => 'El router MikroTik que recibimos se reinicia solo cada 2 horas. ¿Es defecto o configuración?',
                    ],
                    [
                        'author'  => 'admin',
                        'message' => 'Hola, podría ser firmware desactualizado. ¿Podrías compartirnos el log del sistema (System > Log)? Mientras tanto te recomendamos actualizar a la última versión estable.',
                    ],
                ],
            ],
        ];

        foreach ($tickets as $data) {
            $existing = Ticket::where('ticket_code', $data['ticket_code'])->first();
            if ($existing) {
                continue;
            }

            $createdAt = now()->subDays($data['days_ago']);

            $ticket = Ticket::create([
                'ticket_code' => $data['ticket_code'],
                'user_id'     => $data['user']->id,
                'assigned_to' => $data['assigned_to']?->id,
                'subject'     => $data['subject'],
                'category'    => $data['category'],
                'priority'    => $data['priority'],
                'status'      => $data['status'],
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt,
            ]);

            foreach ($data['messages'] as $i => $msg) {
                $author = $msg['author'] === 'admin' ? $admin : $data['user'];

                TicketMessage::create([
                    'ticket_id'   => $ticket->id,
                    'user_id'     => $author->id,
                    'message'     => $msg['message'],
                    'attachments' => null,
                    'created_at'  => $createdAt->copy()->addMinutes($i * 30),
                    'updated_at'  => $createdAt->copy()->addMinutes($i * 30),
                ]);
            }
        }
    }
}
