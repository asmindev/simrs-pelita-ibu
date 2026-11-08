<?php

namespace Database\Factories;

use App\Models\Drug;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PrescriptionItem>
 */
class PrescriptionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(10, 30);

        return [
            'prescription_id' => Prescription::factory(),
            'drug_id' => Drug::factory(),
            'dosage' => fake()->randomElement(['500 mg', '250 mg', '1 tablet', '5 ml']),
            'frequency' => fake()->randomElement(['3x1', '2x1', '1x1']),
            'route' => 'Oral',
            'duration_days' => fake()->numberBetween(3, 10),
            'quantity' => $qty,
            'dispensed_quantity' => 0,
            'instructions' => fake()->randomElement(['Sesudah makan', 'Sebelum makan', 'Saat makan', 'Bila demam']),
            'status' => 'pending',
        ];
    }

    public function dispensed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'dispensed',
            'dispensed_quantity' => $attributes['quantity'] ?? 10,
        ]);
    }
}
