<?php

namespace Database\Factories;

use App\Enums\DiagnosisType;
use App\Models\Diagnosis;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Diagnosis>
 */
class DiagnosisFactory extends Factory
{
    protected $model = Diagnosis::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->patient_id ?? Patient::factory(),
            'icd10_code' => 'A09',
            'icd10_name' => 'Infectious gastroenteritis and colitis, unspecified',
            'type' => DiagnosisType::Primary,
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }

    public function secondary(): static
    {
        return $this->state(fn () => [
            'icd10_code' => 'I10',
            'icd10_name' => 'Essential (primary) hypertension',
            'type' => DiagnosisType::Secondary,
        ]);
    }
}
