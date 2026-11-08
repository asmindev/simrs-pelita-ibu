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
        Schema::create('drug_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drug_id')->constrained('drugs')->cascadeOnDelete();
            $table->string('batch_number');
            $table->date('expiry_date');
            $table->unsignedInteger('initial_quantity')->default(0);
            $table->unsignedInteger('current_quantity')->default(0);
            $table->unsignedInteger('buy_price')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['drug_id', 'expiry_date']);
            $table->index(['drug_id', 'batch_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drug_batches');
    }
};
