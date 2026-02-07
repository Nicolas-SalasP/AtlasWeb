<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
            ['key' => 'store_name', 'value' => 'Atlas Digital Tech', 'type' => 'string'],
            ['key' => 'contact_email', 'value' => 'contacto@atlas.cl', 'type' => 'string'],
            ['key' => 'contact_phone', 'value' => '+56 9 1234 5678', 'type' => 'string'],
            ['key' => 'webpay_enabled', 'value' => '1', 'type' => 'boolean'],
            ['key' => 'webpay_code', 'value' => '597012345678', 'type' => 'string'],
            ['key' => 'free_shipping_threshold', 'value' => '100000', 'type' => 'integer'],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
