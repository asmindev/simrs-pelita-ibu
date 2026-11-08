<?php

namespace Database\Factories;

use App\Models\Drug;
use App\Models\DrugBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DrugBatch>
 */
class DrugBatchFactory extends Factory
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
            'drug_id' => Drug::factory(),
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
