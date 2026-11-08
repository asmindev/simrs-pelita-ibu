<?php

namespace Database\Factories;

use App\Models\DiagnosticOrder;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiagnosticOrder>
 */
class DiagnosticOrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_number' => strtoupper(fake()->unique()->bothify('ORD-2026####')),
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'unit_id' => Unit::factory(),
            'type' => fake()->randomElement(['laboratory', 'radiology']),
            'status' => 'ordered',
            'clinical_notes' => fake()->optional()->sentence(),
            'completed_at' => null,
            'completed_by' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => User::factory(),
        ]);
    }
}
