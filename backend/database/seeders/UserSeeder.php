<?php

namespace Database\Seeders;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'role_id'  => UserRole::Admin->value,
                'name'     => 'Nicolas Salas',
                'rut'      => '26.328.580-8',
                'email'    => 'nicolas@tenri.cl',
                'phone'    => '+56 9 1111 1111',
                'password' => 'password',
                'avatar'   => 'https://ui-avatars.com/api/?name=Nicolas+Salas&background=0F172A&color=fff&bold=true',
            ],
            [
                'role_id'  => UserRole::Cliente->value,
                'name'     => 'Procesadora Insuban Spa',
                'rut'      => '78.730.890-2',
                'email'    => 'contacto@insuban.cl',
                'phone'    => '+56 9 2222 2222',
                'password' => 'password',
                'avatar'   => 'https://ui-avatars.com/api/?name=Insuban&background=2563EB&color=fff&bold=true',
            ],
            [
                'role_id'  => UserRole::Cliente->value,
                'name'     => 'Tsuki Ink',
                'rut'      => '33.333.333-3',
                'email'    => 'ventas@tsuki.cl',
                'phone'    => '+56 9 3333 3333',
                'password' => 'password',
                'avatar'   => 'https://ui-avatars.com/api/?name=Tsuki+Ink&background=DB2777&color=fff&bold=true',
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'role_id'           => $data['role_id'],
                    'name'              => $data['name'],
                    'rut'               => $data['rut'],
                    'phone'             => $data['phone'],
                    'password'          => Hash::make($data['password']),
                    'avatar'            => $data['avatar'],
                    'is_active'         => true,
                    'terms_accepted_at' => now(),
                    'terms_accepted_ip' => '127.0.0.1',
                ]
            );
        }
    }
}
