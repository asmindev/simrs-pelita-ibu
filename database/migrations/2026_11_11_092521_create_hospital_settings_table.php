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
        Schema::create('hospital_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('SIMRS Pelita Ibu');
            $table->string('app_tagline')->nullable()->default('Sistem Informasi Manajemen Rumah Sakit');
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('hospital_name')->default('RS Pelita Ibu');
            $table->string('hospital_code', 50)->nullable();
            $table->string('license_number', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->text('print_header')->nullable();
            $table->text('print_footer')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospital_settings');
    }
};
