<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique();
            $table->foreignId('user_id')->constrained();
            $table->string('subject');
            $table->enum('category', ['ERP', 'Web', 'Facturacion', 'Soporte']);
            $table->enum('priority', ['baja', 'media', 'alta', 'critica']);
            $table->enum('status', ['nuevo', 'abierto', 'esperando_cliente', 'resuelto', 'cerrado'])->default('nuevo');
            $table->timestamps();
        });

        // Mensajes
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets_tables');
    }
};
