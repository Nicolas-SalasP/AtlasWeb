<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('tipo')->default('spa')->after('slug');
        });

        DB::table('services')
            ->where('slug', 'like', 'erp-%')
            ->update(['tipo' => 'erp']);
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
