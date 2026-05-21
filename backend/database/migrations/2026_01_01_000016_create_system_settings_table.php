<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->timestamps();
        });

        DB::table('system_settings')->insert([
            ['key' => 'store_name',              'value' => 'Tenri Spa',           'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_email',           'value' => 'contacto@tenri.cl',   'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_phone',           'value' => '+56 9 1234 5678',     'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_mode',        'value' => '0',                   'type' => 'boolean', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'free_shipping_threshold', 'value' => '100000',              'type' => 'integer', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'webpay_enabled',          'value' => '1',                   'type' => 'boolean', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'webpay_env',              'value' => 'integration',         'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'webpay_code',             'value' => '597012345678',        'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'webpay_api_key',          'value' => null,                  'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'bank_name',               'value' => 'Banco Estado',        'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'bank_account_type',       'value' => 'Cuenta Vista',        'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'bank_account_number',     'value' => '123456789',           'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'bank_rut',                'value' => '11.111.111-1',        'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'bank_email',              'value' => 'pagos@tuempresa.cl',  'type' => 'string',  'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
