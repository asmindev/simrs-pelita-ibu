<?php

namespace Database\Factories;

use App\Models\Dispensing;
use App\Models\DrugBatch;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dispensing>
 */
class DispensingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prescription_id' => Prescription::factory(),
            'prescription_item_id' => PrescriptionItem::factory(),
            'drug_batch_id' => DrugBatch::factory(),
            'quantity' => fake()->numberBetween(10, 30),
            'dispensed_by' => User::factory(),
            'dispensed_at' => now(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
