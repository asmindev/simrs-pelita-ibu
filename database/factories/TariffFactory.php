<?php

namespace Database\Factories;

use App\Enums\TariffCategory;
use App\Models\Tariff;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tariff>
 */
class TariffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('TAR-####')),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement(TariffCategory::cases()),
            'price' => fake()->numberBetween(10, 500) * 1000,
            'unit_id' => null,
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    public function forUnit(Unit $unit): static
    {
        return $this->state(fn (array $attributes): array => [
            'unit_id' => $unit->id,
        ]);
    }
}
