<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('addresses');
        Schema::enableForeignKeyConstraints();
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('alias');
            $table->string('address');
            $table->string('number');
            $table->string('depto')->nullable();
            $table->string('region')->nullable();
            $table->string('commune')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'address_id')) {
                $table->foreign('address_id')
                    ->references('id')->on('addresses')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'address_id')) {
                $table->dropForeign(['address_id']);
            }
        });
        Schema::dropIfExists('addresses');
    }
};