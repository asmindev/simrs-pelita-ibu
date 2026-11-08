<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnostic_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnostic_order_id')->constrained('diagnostic_orders')->cascadeOnDelete();
            $table->foreignId('diagnostic_order_item_id')->nullable()->constrained('diagnostic_order_items')->nullOnDelete();
            $table->string('parameter_name', 255);
            $table->text('result_value');
            $table->string('reference_range', 100)->nullable();
            $table->string('unit', 50)->nullable();
            $table->boolean('is_critical')->default(false);
            $table->text('interpretation')->nullable();
            $table->string('attachment_path', 255)->nullable();
            $table->foreignId('performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnostic_results');
    }
};
