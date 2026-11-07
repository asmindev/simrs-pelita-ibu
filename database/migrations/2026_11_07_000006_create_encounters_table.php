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
        Schema::create('encounters', function (Blueprint $table): void {
            $table->id();
            $table->string('encounter_number', 32)->unique();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units');
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->nullOnDelete();
            $table->string('type', 20)->default('outpatient');
            $table->string('status', 20)->default('arrived');
            $table->foreignId('guarantor_id')->constrained('guarantors');
            $table->timestamp('arrived_at')->useCurrent();
            $table->timestamp('consultation_started_at')->nullable();
            $table->timestamp('consultation_ended_at')->nullable();
            $table->string('cancellation_reason', 500)->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['patient_id', 'arrived_at']);
            $table->index(['unit_id', 'arrived_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('encounters');
    }
};
