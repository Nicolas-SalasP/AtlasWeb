<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Categorías
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Productos
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 0);
            $table->decimal('cost_price', 10, 0)->nullable();
            $table->integer('stock_current')->default(0);
            $table->integer('stock_alert')->default(5);
            $table->foreignId('category_id')->constrained();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Imágenes
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->integer('position')->default(0);
            $table->boolean('is_cover')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_and_categories_tables');
    }
};
