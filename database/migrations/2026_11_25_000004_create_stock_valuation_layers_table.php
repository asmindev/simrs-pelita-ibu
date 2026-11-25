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
        Schema::create('stock_valuation_layers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drug_id')->constrained('drugs')->cascadeOnDelete();
            $table->foreignId('drug_batch_id')->nullable()->constrained('drug_batches')->nullOnDelete();
            $table->foreignId('stock_movement_id')->constrained('stock_movements')->cascadeOnDelete();
            $table->foreignId('stock_location_id')->nullable()->constrained('stock_locations')->nullOnDelete();
            $table->integer('quantity');
            $table->unsignedInteger('remaining_qty')->default(0);
            $table->unsignedInteger('unit_cost')->default(0);
            $table->bigInteger('value');
            $table->bigInteger('remaining_value')->default(0);
            $table->string('reference')->nullable();
            $table->string('description')->nullable();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['drug_id', 'drug_batch_id', 'remaining_qty'], 'svl_drug_batch_remaining_index');
            $table->index('stock_movement_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_valuation_layers');
    }
};
