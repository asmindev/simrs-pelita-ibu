<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductBatch>
 */
class ProductBatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $initial = fake()->numberBetween(50, 500);

        return [
            'product_id' => Product::factory(),
            'batch_number' => strtoupper(fake()->bothify('BATCH-####??')),
            'expiry_date' => fake()->dateTimeBetween('+3 months', '+2 years')->format('Y-m-d'),
            'initial_quantity' => $initial,
            'current_quantity' => $initial,
            'buy_price' => fake()->numberBetween(1, 100) * 1000,
            'is_active' => true,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'expiry_date' => fake()->dateTimeBetween('-1 year', '-1 day')->format('Y-m-d'),
        ]);
    }

    public function empty(): static
    {
        return $this->state(fn (array $attributes): array => [
            'current_quantity' => 0,
        ]);
    }
}
