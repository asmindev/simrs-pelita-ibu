<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Refund>
 */
class RefundFactory extends Factory
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
            'payment_id' => Payment::factory(),
            'refund_number' => strtoupper(fake()->unique()->bothify('REF-2026####')),
            'amount' => 50000,
            'reason' => 'Pengembalian biaya pembatalan tindakan.',
            'approved_by' => User::factory(),
            'processed_at' => now(),
        ];
    }
}
