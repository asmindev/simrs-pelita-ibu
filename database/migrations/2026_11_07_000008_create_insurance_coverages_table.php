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
        Schema::create('insurance_coverages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('guarantor_id')->constrained('guarantors');
            $table->string('card_number', 64)->nullable();
            $table->string('claim_number', 64)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('encounter_id');
            $table->index('guarantor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurance_coverages');
    }
};
