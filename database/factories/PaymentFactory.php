<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'payment_number' => strtoupper(fake()->unique()->bothify('PAY-2026####')),
            'method' => fake()->randomElement(['cash', 'debit_card', 'credit_card', 'bank_transfer', 'qris']),
            'amount' => 150000,
            'change_amount' => 0,
            'reference_number' => fake()->optional()->bothify('REF-####'),
            'notes' => null,
            'paid_at' => now(),
            'received_by' => User::factory(),
        ];
    }
}
