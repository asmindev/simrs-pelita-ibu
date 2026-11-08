<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Admission>
 */
class AdmissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admission_number' => strtoupper(fake()->unique()->bothify('ADM-2026####')),
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'admitted_at' => now(),
            'discharged_at' => null,
            'initial_diagnosis' => 'Demam Berdarah Dengue (DBD)',
            'discharge_diagnosis' => null,
            'discharge_summary' => null,
            'status' => 'active',
        ];
    }

    public function discharged(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'discharged',
            'discharged_at' => now(),
            'discharge_diagnosis' => 'Sembuh perbaikan klinis',
            'discharge_summary' => 'Pasien dipulangkan dalam kondisi stabil dengan obat jalan.',
        ]);
    }
}
