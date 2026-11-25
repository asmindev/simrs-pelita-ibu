<?php

namespace Database\Factories;

use App\Enums\StockLocationUsage;
use App\Models\StockLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockLocation>
 */
class StockLocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('LOC/####')),
            'name' => fake()->words(3, true),
            'usage' => StockLocationUsage::Internal->value,
            'description' => fake()->sentence(),
            'is_default_warehouse' => false,
            'is_active' => true,
        ];
    }
}
