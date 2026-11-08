<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_number' => strtoupper(fake()->unique()->bothify('INV-2026####')),
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'guarantor_id' => Guarantor::factory(),
            'status' => 'draft',
            'subtotal' => 150000,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => 150000,
            'paid_amount' => 0,
            'notes' => fake()->optional()->sentence(),
            'finalized_at' => null,
            'finalized_by' => null,
            'voided_at' => null,
            'voided_by' => null,
            'void_reason' => null,
        ];
    }

    public function finalized(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'finalized',
            'finalized_at' => now(),
            'finalized_by' => User::factory(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'paid',
            'paid_amount' => $attributes['total_amount'] ?? 150000,
            'finalized_at' => now()->subMinutes(10),
            'finalized_by' => User::factory(),
        ]);
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by' => User::factory(),
            'void_reason' => 'Kesalahan pemilihan item billing oleh kasir.',
        ]);
    }
}
