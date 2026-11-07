<?php

namespace Database\Factories;

use App\Models\Drug;
use App\Models\DrugCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Drug>
 */
class DrugFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('OBT-####')),
            'name' => fake()->words(2, true).' '.fake()->randomElement(['500mg', '250mg', '100mg', '10ml']),
            'drug_category_id' => DrugCategory::factory(),
            'form' => fake()->randomElement(['Tablet', 'Kapsul', 'Sirup', 'Salep', 'Injeksi', 'Tetes Mata', 'Kaplet']),
            'strength' => fake()->randomElement(['500 mg', '250 mg', '100 mg', '5 mg', '10 mg', '125 mg/5 ml']),
            'unit_of_measure' => fake()->randomElement(['Tablet', 'Kapsul', 'Botol', 'Tube', 'Ampul', 'Vial', 'Strip']),
            'price' => fake()->numberBetween(5, 200) * 1000,
            'manufacturer' => fake()->company().' Pharma',
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
