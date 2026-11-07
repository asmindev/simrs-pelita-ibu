<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Procedure;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Procedure>
 */
class ProcedureFactory extends Factory
{
    protected $model = Procedure::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->patient_id ?? Patient::factory(),
            'icd9_code' => '86.59',
            'name' => 'Other closure of skin and subcutaneous tissue',
            'notes' => fake()->optional()->sentence(),
            'performed_by' => Doctor::factory(),
            'created_by' => User::factory(),
        ];
    }
}
