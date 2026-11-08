<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prescription_number' => strtoupper(fake()->unique()->bothify('RX-2026####')),
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'unit_id' => Unit::factory(),
            'status' => 'submitted',
            'notes' => fake()->optional()->sentence(),
            'verification_notes' => null,
            'pharmacist_id' => null,
            'verified_at' => null,
            'dispensed_at' => null,
            'cancelled_at' => null,
            'cancel_reason' => null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'verified',
            'pharmacist_id' => User::factory(),
            'verified_at' => now(),
            'verification_notes' => 'Resep telah ditelaah dan valid.',
        ]);
    }

    public function dispensed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'dispensed',
            'pharmacist_id' => User::factory(),
            'verified_at' => now()->subMinutes(15),
            'dispensed_at' => now(),
            'verification_notes' => 'Obat telah disiapkan dan diserahkan ke pasien.',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => 'Permintaan dokter / pembatalan pengobatan.',
        ]);
    }
}
