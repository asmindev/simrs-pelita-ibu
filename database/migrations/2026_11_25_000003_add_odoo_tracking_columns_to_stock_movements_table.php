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
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->string('reference_number')->nullable()->after('id');
            $table->foreignId('source_location_id')->nullable()->after('drug_batch_id')->constrained('stock_locations')->nullOnDelete();
            $table->foreignId('destination_location_id')->nullable()->after('source_location_id')->constrained('stock_locations')->nullOnDelete();
            $table->unsignedInteger('unit_cost')->default(0)->after('balance_after');
            $table->bigInteger('total_value')->default(0)->after('unit_cost');
            $table->string('origin')->nullable()->after('reference_id');
            $table->string('state')->default('done')->after('origin');

            $table->index('reference_number');
            $table->index(['source_location_id', 'destination_location_id'], 'stock_movements_locations_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex(['reference_number']);
            $table->dropIndex('stock_movements_locations_index');
            $table->dropConstrainedForeignId('source_location_id');
            $table->dropConstrainedForeignId('destination_location_id');
            $table->dropColumn([
                'reference_number',
                'unit_cost',
                'total_value',
                'origin',
                'state',
            ]);
        });
    }
};
