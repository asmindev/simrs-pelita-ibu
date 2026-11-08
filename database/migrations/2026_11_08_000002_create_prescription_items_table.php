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
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->foreignId('drug_id')->constrained('drugs')->cascadeOnDelete();
            $table->string('dosage');
            $table->string('frequency');
            $table->string('route')->default('Oral');
            $table->unsignedInteger('duration_days')->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('dispensed_quantity')->default(0);
            $table->string('instructions')->nullable();
            $table->string('status')->default('pending'); // pending, dispensed, cancelled
            $table->timestamps();

            $table->index(['prescription_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
