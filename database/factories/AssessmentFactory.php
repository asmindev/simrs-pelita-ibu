<?php

namespace Database\Factories;

use App\Enums\AssessmentType;
use App\Models\Assessment;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Assessment>
 */
class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->patient_id ?? Patient::factory(),
            'created_by' => User::factory(),
            'type' => AssessmentType::Soap,
            'subjective' => fake()->paragraph(),
            'objective' => fake()->paragraph(),
            'assessment' => fake()->sentence(),
            'plan' => fake()->sentence(),
            'vital_signs' => [
                'systolic' => fake()->numberBetween(90, 140),
                'diastolic' => fake()->numberBetween(60, 90),
                'heart_rate' => fake()->numberBetween(60, 100),
                'respiratory_rate' => fake()->numberBetween(14, 22),
                'temperature' => fake()->randomFloat(1, 36.0, 38.5),
                'spo2' => fake()->numberBetween(95, 100),
                'weight' => fake()->numberBetween(45, 90),
                'height' => fake()->numberBetween(150, 185),
            ],
            'triage_level' => 'green',
            'allergies' => fake()->optional()->word(),
            'is_final' => false,
            'finalized_at' => null,
            'finalized_by' => null,
        ];
    }

    public function final(): static
    {
        return $this->state(fn () => [
            'is_final' => true,
            'finalized_at' => now(),
            'finalized_by' => User::factory(),
        ]);
    }

    public function nurse(): static
    {
        return $this->state(fn () => [
            'type' => AssessmentType::Nursing,
        ]);
    }
}
