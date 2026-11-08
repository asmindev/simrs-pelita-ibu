<?php

namespace Database\Factories;

use App\Models\Bed;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bed>
 */
class BedFactory extends Factory
{
    public function definition(): array
    {
        return [
            'room_name' => fake()->randomElement(['Ruang Mawar', 'Ruang Melati', 'Ruang Anggrek', 'ICU']),
            'bed_number' => strtoupper(fake()->unique()->bothify('BED-####')),
            'class' => fake()->randomElement(['vip', 'class_1', 'class_2', 'class_3', 'icu']),
            'daily_rate' => fake()->randomElement([250000, 350000, 500000, 1000000]),
            'status' => 'available',
            'notes' => null,
        ];
    }

    public function occupied(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'occupied',
        ]);
    }
}
