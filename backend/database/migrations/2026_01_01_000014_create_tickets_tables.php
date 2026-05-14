<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject');
            $table->enum('category', ['ERP', 'Web', 'Facturacion', 'Soporte']);
            $table->enum('priority', ['baja', 'media', 'alta', 'critica']);
            $table->enum('status', [
                'nuevo',
                'abierto',
                'esperando_cliente',
                'resuelto',
                'cerrado',
            ])->default('nuevo');
            $table->timestamps();

            $table->index('status');
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index('assigned_to');
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index(['ticket_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
    }
};
