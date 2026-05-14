<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('rut', 20)->nullable()->index();
            $table->foreignId('address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->decimal('subtotal', 12, 0);
            $table->decimal('shipping_cost', 12, 0);
            $table->decimal('total', 12, 0);
            $table->enum('status', [
                'pending',
                'paid',
                'preparing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded',
            ])->default('pending');
            $table->text('shipping_address')->nullable();
            $table->string('shipping_provider')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('transfer_reference')->nullable();
            $table->timestamp('transfer_date')->nullable();
            $table->json('customer_data')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('transaction_token')->nullable()->index();
            $table->json('payment_data')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
            $table->string('terms_accepted_ip', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index(['payment_method', 'status']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('product_name');
            $table->string('sku_snapshot');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 0);
            $table->decimal('total_line', 12, 0);
            $table->string('item_status')->default('sold');

            $table->index('order_id');
            $table->index('product_id');
        });

        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->string('actor_name')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'created_at']);
            $table->index('to_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
