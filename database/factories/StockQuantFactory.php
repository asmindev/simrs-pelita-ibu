<?php

namespace Database\Factories;

use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\StockLocation;
use App\Models\StockQuant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockQuant>
 */
class StockQuantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_location_id' => StockLocation::factory(),
            'drug_id' => Drug::factory(),
            'drug_batch_id' => DrugBatch::factory(),
            'quantity' => fake()->numberBetween(10, 100),
        ];
    }
}
