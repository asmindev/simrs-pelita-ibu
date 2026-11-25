<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductBatch;
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
            'product_id' => Product::factory(),
            'product_batch_id' => ProductBatch::factory(),
            'quantity' => fake()->numberBetween(10, 100),
        ];
    }
}
