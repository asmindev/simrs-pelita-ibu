<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\RecordAddendum;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecordAddendum>
 */
class RecordAddendumFactory extends Factory
{
    protected $model = RecordAddendum::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'assessment_id' => Assessment::factory()->final(),
            'reason' => 'Koreksi dosis obat pada rencana terapi',
            'content' => 'Rencana terapi ditambahkan catatan pemantauan ginjal setelah 3 hari.',
            'created_by' => User::factory(),
        ];
    }
}
