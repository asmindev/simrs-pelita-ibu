<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('admission_number', 50)->unique();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->timestamp('admitted_at')->useCurrent();
            $table->timestamp('discharged_at')->nullable();
            $table->text('initial_diagnosis')->nullable();
            $table->text('discharge_diagnosis')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->string('status', 30)->default('active')->index(); // active, discharged, transferred
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
