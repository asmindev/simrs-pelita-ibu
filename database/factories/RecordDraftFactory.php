<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\RecordDraft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecordDraft>
 */
class RecordDraftFactory extends Factory
{
    protected $model = RecordDraft::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'user_id' => User::factory(),
            'form_type' => 'soap',
            'content' => [
                'subjective' => 'Keluhan utama pusing sejak 2 hari...',
                'objective' => 'Tekanan darah 120/80...',
            ],
        ];
    }
}
