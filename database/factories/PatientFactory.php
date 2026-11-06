<?php

namespace Database\Factories;

use App\Enums\PatientGender;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'medical_record_number' => fake()->unique()->numerify('RM-########'),
            'nik' => fake()->unique()->numerify('################'),
            'name' => fake()->name(),
            'gender' => fake()->randomElement(PatientGender::cases()),
            'birth_date' => fake()->dateTimeBetween('-90 years', '-1 day'),
            'address' => fake()->address(),
            'phone' => fake()->numerify('08##########'),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    public function withoutNik(): static
    {
        return $this->state(fn (array $attributes): array => [
            'nik' => null,
        ]);
    }
}
