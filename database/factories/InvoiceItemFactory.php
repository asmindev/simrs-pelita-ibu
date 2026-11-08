<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(10000, 100000);
        $quantity = fake()->numberBetween(1, 3);
        $subtotal = $unitPrice * $quantity;

        return [
            'invoice_id' => Invoice::factory(),
            'item_type' => fake()->randomElement(['registration', 'consultation', 'tariff', 'drug']),
            'reference_id' => fake()->numberBetween(1, 100),
            'name' => fake()->words(3, true),
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'discount_amount' => 0,
            'total' => $subtotal,
            'notes' => null,
        ];
    }
}
