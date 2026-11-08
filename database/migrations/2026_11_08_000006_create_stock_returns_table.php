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
        Schema::create('stock_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->foreignId('prescription_item_id')->constrained('prescription_items')->cascadeOnDelete();
            $table->foreignId('drug_batch_id')->constrained('drug_batches')->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->text('return_reason');
            $table->foreignId('returned_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('returned_at');
            $table->timestamps();

            $table->index(['prescription_id', 'returned_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_returns');
    }
};
