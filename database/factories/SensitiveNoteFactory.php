<?php

namespace Database\Factories;

use App\Enums\SensitiveCategory;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\SensitiveNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SensitiveNote>
 */
class SensitiveNoteFactory extends Factory
{
    protected $model = SensitiveNote::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->patient_id ?? Patient::factory(),
            'category' => SensitiveCategory::Psychiatry,
            'content' => fake()->paragraph(),
            'created_by' => User::factory(),
        ];
    }

    public function hiv(): static
    {
        return $this->state(fn () => [
            'category' => SensitiveCategory::Hiv,
        ]);
    }
}
