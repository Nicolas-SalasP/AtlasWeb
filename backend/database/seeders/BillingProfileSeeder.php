<?php

namespace Database\Seeders;

use App\Domain\Billing\Models\BillingProfile;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;

class BillingProfileSeeder extends Seeder
{
    public function run(): void
    {
        $profiles = [
            [
                'email'         => 'nicolas@tenri.cl',
                'rut'           => '78.149.179-9',
                'business_name' => 'Tenri Spa',
                'business_line' => 'Desarrollo de Software y Tecnología',
                'address'       => 'Av. Principal 1234',
                'city'          => 'Pudahuel',
                'email_dte'     => 'contacto@tenri.cl',
            ],
            [
                'email'         => 'contacto@insuban.cl',
                'rut'           => '78.730.890-2',
                'business_name' => 'Procesadora Insuban Spa',
                'business_line' => 'Procesamiento de Alimentos',
                'address'       => 'Av. Industrial 1234',
                'city'          => 'Santiago Centro',
                'email_dte'     => 'facturacion@insuban.cl',
            ],
            [
                'email'         => 'ventas@tsuki.cl',
                'rut'           => '33.333.333-3',
                'business_name' => 'Tsuki Ink Store',
                'business_line' => 'Venta de Insumos de Tatuaje',
                'address'       => 'Av. Providencia 456',
                'city'          => 'Providencia',
                'email_dte'     => 'facturacion@tsuki.cl',
            ],
        ];

        foreach ($profiles as $data) {
            $user = User::where('email', $data['email'])->first();
            if (!$user) {
                continue;
            }

            BillingProfile::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'rut'     => $data['rut'],
                ],
                [
                    'business_name' => $data['business_name'],
                    'business_line' => $data['business_line'],
                    'address'       => $data['address'],
                    'city'          => $data['city'],
                    'email_dte'     => $data['email_dte'],
                    'is_default'    => true,
                ]
            );
        }
    }
}
