<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\InsuranceCoverage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InsuranceCoverage>
 */
class InsuranceCoverageFactory extends Factory
{
    protected $model = InsuranceCoverage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'guarantor_id' => Guarantor::factory(),
            'card_number' => fake()->numerify('0001########'),
            'claim_number' => fake()->optional()->numerify('SEP-########'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
