<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop foreign keys and affected indexes before renaming tables/columns
        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->dropForeign('stock_valuation_layers_drug_id_foreign');
            $table->dropForeign('stock_valuation_layers_drug_batch_id_foreign');
            $table->dropIndex('svl_drug_batch_remaining_index');
        });

        Schema::table('stock_quants', function (Blueprint $table) {
            $table->dropForeign('stock_quants_stock_location_id_foreign');
            $table->dropForeign('stock_quants_drug_id_foreign');
            $table->dropForeign('stock_quants_drug_batch_id_foreign');
            $table->dropUnique('stock_quants_location_drug_batch_unique');
            $table->dropIndex('stock_quants_drug_id_stock_location_id_index');
        });

        Schema::table('stock_returns', function (Blueprint $table) {
            $table->dropForeign('stock_returns_drug_batch_id_foreign');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign('stock_movements_drug_id_foreign');
            $table->dropForeign('stock_movements_drug_batch_id_foreign');
            $table->dropIndex('stock_movements_drug_id_created_at_index');
        });

        Schema::table('dispensings', function (Blueprint $table) {
            $table->dropForeign('dispensings_drug_batch_id_foreign');
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropForeign('prescription_items_drug_id_foreign');
        });

        Schema::table('drug_batches', function (Blueprint $table) {
            $table->dropForeign('drug_batches_drug_id_foreign');
            $table->dropIndex('drug_batches_drug_id_expiry_date_index');
            $table->dropIndex('drug_batches_drug_id_batch_number_index');
        });

        Schema::table('drugs', function (Blueprint $table) {
            $table->dropForeign('drugs_drug_category_id_foreign');
            $table->dropIndex('drugs_drug_category_id_is_active_index');
        });

        // 2. Rename core tables
        Schema::rename('drug_categories', 'product_categories');
        Schema::rename('drugs', 'products');
        Schema::rename('drug_batches', 'product_batches');

        // 3. Rename columns and re-create foreign keys & indexes
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('drug_category_id', 'product_category_id');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('product_category_id')->references('id')->on('product_categories')->restrictOnDelete();
            $table->index(['product_category_id', 'is_active']);
        });

        Schema::table('product_batches', function (Blueprint $table) {
            $table->renameColumn('drug_id', 'product_id');
        });
        Schema::table('product_batches', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->index(['product_id', 'expiry_date']);
            $table->index(['product_id', 'batch_number']);
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->renameColumn('drug_id', 'product_id');
        });
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::table('dispensings', function (Blueprint $table) {
            $table->renameColumn('drug_batch_id', 'product_batch_id');
        });
        Schema::table('dispensings', function (Blueprint $table) {
            $table->foreign('product_batch_id')->references('id')->on('product_batches')->cascadeOnDelete();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->renameColumn('drug_id', 'product_id');
            $table->renameColumn('drug_batch_id', 'product_batch_id');
        });
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('product_batch_id')->references('id')->on('product_batches')->nullOnDelete();
            $table->index(['product_id', 'created_at']);
        });

        Schema::table('stock_returns', function (Blueprint $table) {
            $table->renameColumn('drug_batch_id', 'product_batch_id');
        });
        Schema::table('stock_returns', function (Blueprint $table) {
            $table->foreign('product_batch_id')->references('id')->on('product_batches')->cascadeOnDelete();
        });

        Schema::table('stock_quants', function (Blueprint $table) {
            $table->renameColumn('drug_id', 'product_id');
            $table->renameColumn('drug_batch_id', 'product_batch_id');
        });
        Schema::table('stock_quants', function (Blueprint $table) {
            $table->unique(['stock_location_id', 'product_id', 'product_batch_id'], 'stock_quants_location_product_batch_unique');
            $table->index(['product_id', 'stock_location_id']);
            $table->foreign('stock_location_id')->references('id')->on('stock_locations')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('product_batch_id')->references('id')->on('product_batches')->cascadeOnDelete();
        });

        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->renameColumn('drug_id', 'product_id');
            $table->renameColumn('drug_batch_id', 'product_batch_id');
        });
        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('product_batch_id')->references('id')->on('product_batches')->nullOnDelete();
            $table->index(['product_id', 'product_batch_id', 'remaining_qty'], 'svl_product_batch_remaining_index');
        });

        if (Schema::hasTable('activity_log')) {
            DB::table('activity_log')->where('subject_type', 'App\\Models\\Drug')->update(['subject_type' => 'App\\Models\\Product']);
            DB::table('activity_log')->where('subject_type', 'App\\Models\\DrugCategory')->update(['subject_type' => 'App\\Models\\ProductCategory']);
            DB::table('activity_log')->where('subject_type', 'App\\Models\\DrugBatch')->update(['subject_type' => 'App\\Models\\ProductBatch']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('activity_log')) {
            DB::table('activity_log')->where('subject_type', 'App\\Models\\Product')->update(['subject_type' => 'App\\Models\\Drug']);
            DB::table('activity_log')->where('subject_type', 'App\\Models\\ProductCategory')->update(['subject_type' => 'App\\Models\\DrugCategory']);
            DB::table('activity_log')->where('subject_type', 'App\\Models\\ProductBatch')->update(['subject_type' => 'App\\Models\\DrugBatch']);
        }

        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['product_batch_id']);
            $table->dropIndex('svl_product_batch_remaining_index');
        });

        Schema::table('stock_quants', function (Blueprint $table) {
            $table->dropForeign(['stock_location_id']);
            $table->dropForeign(['product_id']);
            $table->dropForeign(['product_batch_id']);
            $table->dropUnique('stock_quants_location_product_batch_unique');
            $table->dropIndex(['product_id', 'stock_location_id']);
        });

        Schema::table('stock_returns', function (Blueprint $table) {
            $table->dropForeign(['product_batch_id']);
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['product_batch_id']);
            $table->dropIndex(['product_id', 'created_at']);
        });

        Schema::table('dispensings', function (Blueprint $table) {
            $table->dropForeign(['product_batch_id']);
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('product_batches', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropIndex(['product_id', 'expiry_date']);
            $table->dropIndex(['product_id', 'batch_number']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_category_id']);
            $table->dropIndex(['product_category_id', 'is_active']);
        });

        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->renameColumn('product_id', 'drug_id');
            $table->renameColumn('product_batch_id', 'drug_batch_id');
        });

        Schema::table('stock_quants', function (Blueprint $table) {
            $table->renameColumn('product_id', 'drug_id');
            $table->renameColumn('product_batch_id', 'drug_batch_id');
        });

        Schema::table('stock_returns', function (Blueprint $table) {
            $table->renameColumn('product_batch_id', 'drug_batch_id');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->renameColumn('product_id', 'drug_id');
            $table->renameColumn('product_batch_id', 'drug_batch_id');
        });

        Schema::table('dispensings', function (Blueprint $table) {
            $table->renameColumn('product_batch_id', 'drug_batch_id');
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->renameColumn('product_id', 'drug_id');
        });

        Schema::table('product_batches', function (Blueprint $table) {
            $table->renameColumn('product_id', 'drug_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('product_category_id', 'drug_category_id');
        });

        Schema::rename('product_batches', 'drug_batches');
        Schema::rename('products', 'drugs');
        Schema::rename('product_categories', 'drug_categories');

        Schema::table('drugs', function (Blueprint $table) {
            $table->foreign('drug_category_id')->references('id')->on('drug_categories')->restrictOnDelete();
            $table->index(['drug_category_id', 'is_active']);
        });

        Schema::table('drug_batches', function (Blueprint $table) {
            $table->foreign('drug_id')->references('id')->on('drugs')->cascadeOnDelete();
            $table->index(['drug_id', 'expiry_date']);
            $table->index(['drug_id', 'batch_number']);
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->foreign('drug_id')->references('id')->on('drugs')->cascadeOnDelete();
        });

        Schema::table('dispensings', function (Blueprint $table) {
            $table->foreign('drug_batch_id')->references('id')->on('drug_batches')->cascadeOnDelete();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreign('drug_id')->references('id')->on('drugs')->cascadeOnDelete();
            $table->foreign('drug_batch_id')->references('id')->on('drug_batches')->nullOnDelete();
            $table->index(['drug_id', 'created_at']);
        });

        Schema::table('stock_returns', function (Blueprint $table) {
            $table->foreign('drug_batch_id')->references('id')->on('drug_batches')->cascadeOnDelete();
        });

        Schema::table('stock_quants', function (Blueprint $table) {
            $table->unique(['stock_location_id', 'drug_id', 'drug_batch_id'], 'stock_quants_location_drug_batch_unique');
            $table->index(['drug_id', 'stock_location_id']);
            $table->foreign('stock_location_id')->references('id')->on('stock_locations')->cascadeOnDelete();
            $table->foreign('drug_id')->references('id')->on('drugs')->cascadeOnDelete();
            $table->foreign('drug_batch_id')->references('id')->on('drug_batches')->cascadeOnDelete();
        });

        Schema::table('stock_valuation_layers', function (Blueprint $table) {
            $table->foreign('drug_id')->references('id')->on('drugs')->cascadeOnDelete();
            $table->foreign('drug_batch_id')->references('id')->on('drug_batches')->nullOnDelete();
            $table->index(['drug_id', 'drug_batch_id', 'remaining_qty'], 'svl_drug_batch_remaining_index');
        });
    }
};
