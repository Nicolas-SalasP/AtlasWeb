<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Órdenes
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('address_id')->nullable();
            $table->decimal('subtotal', 12, 0);
            $table->decimal('shipping_cost', 12, 0);
            $table->decimal('total', 12, 0);
            $table->enum('status', ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Detalle de Órden (Snapshot de precios)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('sku_snapshot');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 0);
            $table->decimal('total_line', 12, 0);
        });

        // Pagos (Pasarela)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway');
            $table->string('transaction_id')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected']);
            $table->decimal('amount', 12, 0);
            $table->json('gateway_data')->nullable();
            $table->timestamps();
        });

        // Envíos
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('courier');
            $table->string('tracking_number')->nullable();
            $table->enum('status', ['preparing', 'in_transit', 'delivered', 'failed']);
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_and_logistics_tables');
    }
};
