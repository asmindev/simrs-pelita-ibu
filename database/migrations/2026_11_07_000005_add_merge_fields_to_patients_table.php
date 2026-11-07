<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->foreignId('merged_to_patient_id')
                ->nullable()
                ->after('is_active')
                ->constrained('patients')
                ->nullOnDelete();
            $table->timestamp('merged_at')
                ->nullable()
                ->after('merged_to_patient_id');

            $table->index('merged_to_patient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['merged_to_patient_id']);
            $table->dropIndex(['merged_to_patient_id']);
            $table->dropColumn(['merged_to_patient_id', 'merged_at']);
        });
    }
};
