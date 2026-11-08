<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnostic_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnostic_order_id')->constrained('diagnostic_orders')->cascadeOnDelete();
            $table->foreignId('tariff_id')->nullable()->constrained('tariffs')->nullOnDelete();
            $table->string('test_name', 255);
            $table->string('status', 30)->default('pending'); // pending, completed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnostic_order_items');
    }
};
