<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('name');
            $table->boolean('is_popular')->default(false)->after('is_active');
            $table->string('price_uf')->nullable()->after('price');
            $table->string('price_label')->nullable()->after('price_uf');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['slug', 'is_popular', 'price_uf', 'price_label']);
        });
    }
};
