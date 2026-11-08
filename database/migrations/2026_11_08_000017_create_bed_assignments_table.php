<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bed_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_id')->constrained('admissions')->cascadeOnDelete();
            $table->foreignId('bed_id')->constrained('beds')->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('released_at')->nullable();
            $table->foreignId('assigned_by')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bed_assignments');
    }
};
