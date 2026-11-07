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
        Schema::create('drugs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('drug_category_id')->constrained('drug_categories')->restrictOnDelete();
            $table->string('form');
            $table->string('strength');
            $table->string('unit_of_measure');
            $table->unsignedInteger('price');
            $table->string('manufacturer');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['drug_category_id', 'is_active']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drugs');
    }
};
