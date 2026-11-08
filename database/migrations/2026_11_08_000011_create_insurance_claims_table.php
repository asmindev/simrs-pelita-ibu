<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('guarantor_id')->constrained('guarantors')->cascadeOnDelete();
            $table->string('claim_number', 60)->nullable()->index();
            $table->string('status', 30)->default('submitted')->index(); // submitted, verified, approved, rejected
            $table->decimal('claimed_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
    }
};
