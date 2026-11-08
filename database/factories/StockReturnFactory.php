<?php

namespace Database\Factories;

use App\Models\DrugBatch;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\StockReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockReturn>
 */
class StockReturnFactory extends Factory
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
            'quantity' => fake()->numberBetween(1, 10),
            'return_reason' => 'Pasien alergi obat / instruksi dokter diganti.',
            'returned_by' => User::factory(),
            'returned_at' => now(),
        ];
    }
}
