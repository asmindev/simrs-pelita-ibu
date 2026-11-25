<?php

namespace Database\Factories;

use App\Enums\ProductType;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('PRD-####')),
            'name' => fake()->words(2, true).' '.fake()->randomElement(['500mg', '250mg', '100mg', '10ml']),
            'product_type' => ProductType::Drug->value,
            'product_category_id' => ProductCategory::factory(),
            'form' => fake()->randomElement(['Tablet', 'Kapsul', 'Sirup', 'Salep', 'Injeksi', 'Tetes Mata', 'Kaplet']),
            'strength' => fake()->randomElement(['500 mg', '250 mg', '100 mg', '5 mg', '10 mg', '125 mg/5 ml']),
            'unit_of_measure' => fake()->randomElement(['Tablet', 'Kapsul', 'Botol', 'Tube', 'Ampul', 'Vial', 'Strip']),
            'price' => fake()->numberBetween(5, 200) * 1000,
            'manufacturer' => fake()->company().' Pharma',
            'description' => null,
            'image_path' => null,
            'is_active' => true,
        ];
    }

    public function medicalSupply(): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_type' => ProductType::MedicalSupply->value,
            'form' => null,
            'strength' => null,
            'unit_of_measure' => fake()->randomElement(['Pcs', 'Box', 'Roll', 'Set']),
        ]);
    }

    public function reagent(): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_type' => ProductType::Reagent->value,
            'form' => null,
            'strength' => null,
            'unit_of_measure' => fake()->randomElement(['Botol', 'Kit', 'Vial']),
        ]);
    }

    public function general(): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_type' => ProductType::General->value,
            'form' => null,
            'strength' => null,
            'unit_of_measure' => fake()->randomElement(['Pcs', 'Unit', 'Pack']),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
