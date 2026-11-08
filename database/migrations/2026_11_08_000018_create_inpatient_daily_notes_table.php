<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inpatient_daily_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_id')->constrained('admissions')->cascadeOnDelete();
            $table->string('note_type', 30)->default('nurse'); // nurse, doctor_visit
            $table->json('vital_signs')->nullable();
            $table->text('subjective')->nullable();
            $table->text('objective')->nullable();
            $table->text('assessment')->nullable();
            $table->text('plan')->nullable();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inpatient_daily_notes');
    }
};
