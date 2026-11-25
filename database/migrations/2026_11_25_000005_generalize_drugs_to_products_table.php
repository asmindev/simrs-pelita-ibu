<?php

use App\Enums\ProductType;
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
        Schema::table('drugs', function (Blueprint $table) {
            $table->string('product_type')->default(ProductType::Drug->value)->after('name');
            $table->text('description')->nullable()->after('manufacturer');
            $table->string('form')->nullable()->change();
            $table->string('strength')->nullable()->change();
            $table->string('manufacturer')->nullable()->change();

            $table->index(['product_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drugs', function (Blueprint $table) {
            $table->dropIndex(['product_type', 'is_active']);
            $table->dropColumn(['product_type', 'description']);
        });
    }
};
