<?php

namespace Database\Factories;

use App\Models\Guarantor;
use App\Models\InsuranceClaim;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InsuranceClaim>
 */
class InsuranceClaimFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'guarantor_id' => Guarantor::factory(),
            'claim_number' => strtoupper(fake()->unique()->bothify('CLM-2026####')),
            'status' => 'submitted',
            'claimed_amount' => 250000,
            'approved_amount' => 0,
            'rejection_reason' => null,
            'notes' => null,
            'submitted_at' => now(),
        ];
    }
}
