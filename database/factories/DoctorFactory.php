<?php

namespace Database\Factories;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->numerify('DOK-####')),
            'name' => 'dr. '.fake()->unique()->name(),
            'specialization' => fake()->randomElement([
                'Penyakit Dalam',
                'Anak',
                'Bedah',
                'Obstetri dan Ginekologi',
                'Mata',
            ]),
            'license_number' => strtoupper(fake()->unique()->bothify('SIP-####-????')),
            'phone' => fake()->numerify('08##########'),
            'email' => fake()->unique()->safeEmail(),
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
