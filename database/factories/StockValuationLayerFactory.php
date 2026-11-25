<?php

namespace Database\Factories;

use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\StockLocation;
use App\Models\StockMovement;
use App\Models\StockValuationLayer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockValuationLayer>
 */
class StockValuationLayerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(10, 100);
        $unitCost = fake()->numberBetween(500, 10000);

        return [
            'drug_id' => Drug::factory(),
            'drug_batch_id' => DrugBatch::factory(),
            'stock_movement_id' => StockMovement::factory(),
            'stock_location_id' => StockLocation::factory(),
            'quantity' => $qty,
            'remaining_qty' => $qty,
            'unit_cost' => $unitCost,
            'value' => $qty * $unitCost,
            'remaining_value' => $qty * $unitCost,
            'reference' => 'WH/IN/TEST',
            'description' => 'Initial valuation layer',
            'user_id' => User::factory(),
        ];
    }
}
