<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\InpatientDailyNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InpatientDailyNote>
 */
class InpatientDailyNoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admission_id' => Admission::factory(),
            'note_type' => 'nurse',
            'vital_signs' => [
                'blood_pressure' => '120/80',
                'pulse_rate' => 82,
                'temperature' => 36.8,
                'respiratory_rate' => 18,
            ],
            'subjective' => 'Pasien mengeluh pusing berkurang, nafsu makan membaik.',
            'objective' => 'Keadaan umum tampak tenang, infus NaCl berjalan lancar.',
            'assessment' => 'DBD hari rawat ke-3 dalam perbaikan.',
            'plan' => 'Lanjutkan terapi cairan, cek lab darah rutin sore ini.',
            'author_id' => User::factory(),
        ];
    }
}
