<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\BedAssignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BedAssignment>
 */
class BedAssignmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admission_id' => Admission::factory(),
            'bed_id' => Bed::factory()->occupied(),
            'assigned_at' => now(),
            'released_at' => null,
            'assigned_by' => User::factory(),
            'reason' => 'Admisi awal pasien rawat inap',
        ];
    }
}
