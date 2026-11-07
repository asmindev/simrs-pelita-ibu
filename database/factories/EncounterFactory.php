<?php

namespace Database\Factories;

use App\Enums\EncounterStatus;
use App\Enums\EncounterType;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Patient;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Encounter>
 */
class EncounterFactory extends Factory
{
    protected $model = Encounter::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_number' => 'ENC-'.now()->format('Ymd').'-'.fake()->unique()->numerify('#####'),
            'patient_id' => Patient::factory(),
            'unit_id' => Unit::factory(),
            'doctor_id' => Doctor::factory(),
            'type' => EncounterType::Outpatient,
            'status' => EncounterStatus::Arrived,
            'guarantor_id' => Guarantor::factory(),
            'arrived_at' => now(),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function emergency(): static
    {
        return $this->state(fn () => [
            'type' => EncounterType::Emergency,
        ]);
    }

    public function inConsultation(): static
    {
        return $this->state(fn () => [
            'status' => EncounterStatus::InConsultation,
            'consultation_started_at' => now(),
        ]);
    }

    public function finished(): static
    {
        return $this->state(fn () => [
            'status' => EncounterStatus::Finished,
            'consultation_started_at' => now()->subMinutes(30),
            'consultation_ended_at' => now(),
        ]);
    }

    public function cancelled(?string $reason = null): static
    {
        return $this->state(fn () => [
            'status' => EncounterStatus::Cancelled,
            'cancellation_reason' => $reason ?? 'Pasien membatalkan kedatangan.',
            'cancelled_at' => now(),
            'cancelled_by' => User::factory(),
        ]);
    }
}
