<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('bank_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_domain');
            $table->integer('amount');
            $table->string('transaction_number')->unique();
            $table->string('sender_name')->nullable();
            $table->string('rut_prefix')->nullable();
            $table->string('glosa')->nullable(); 
            $table->text('raw_content')->nullable();

            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['matched', 'unmatched'])->default('unmatched');

            $table->timestamp('transfer_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_receipts');
    }
};
