<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->string('room_name', 100);
            $table->string('bed_number', 50)->unique();
            $table->string('class', 30)->default('class_3'); // vip, class_1, class_2, class_3, icu
            $table->decimal('daily_rate', 15, 2)->default(0);
            $table->string('status', 30)->default('available')->index(); // available, occupied, maintenance
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};
