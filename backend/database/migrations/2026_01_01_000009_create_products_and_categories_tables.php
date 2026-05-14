<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('specs')->nullable();
            $table->decimal('price', 10, 0);
            $table->decimal('cost_price', 10, 0)->nullable();
            $table->integer('stock_current')->default(0);
            $table->integer('stock_alert')->default(5);
            $table->foreignId('category_id')->constrained();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_visible');
            $table->index('category_id');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->integer('position')->default(0);
            $table->boolean('is_cover')->default(false);

            $table->index(['product_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
