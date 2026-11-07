<?php

namespace Database\Factories;

use App\Enums\ClinicalReportType;
use App\Models\ClinicalReport;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicalReport>
 */
class ClinicalReportFactory extends Factory
{
    protected $model = ClinicalReport::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->patient_id ?? Patient::factory(),
            'report_type' => ClinicalReportType::Surgery,
            'title' => 'Laporan Operasi Appendectomy',
            'content' => fake()->paragraphs(3, true),
            'reported_at' => now(),
            'doctor_id' => Doctor::factory(),
            'created_by' => User::factory(),
        ];
    }

    public function birth(): static
    {
        return $this->state(fn () => [
            'report_type' => ClinicalReportType::Birth,
            'title' => 'Surat Keterangan Kelahiran',
        ]);
    }

    public function death(): static
    {
        return $this->state(fn () => [
            'report_type' => ClinicalReportType::Death,
            'title' => 'Surat Keterangan Kematian',
        ]);
    }
}
