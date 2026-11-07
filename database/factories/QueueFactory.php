<?php

namespace Database\Factories;

use App\Enums\QueueStatus;
use App\Models\Encounter;
use App\Models\Queue;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Queue>
 */
class QueueFactory extends Factory
{
    protected $model = Queue::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $queueNumber = fake()->numberBetween(1, 999);

        return [
            'encounter_id' => Encounter::factory(),
            'unit_id' => fn (array $attributes) => Encounter::find($attributes['encounter_id'])?->unit_id ?? Unit::factory(),
            'queue_date' => today(),
            'queue_number' => $queueNumber,
            'queue_code' => 'Q-'.str_pad((string) $queueNumber, 3, '0', STR_PAD_LEFT),
            'status' => QueueStatus::Waiting,
        ];
    }

    public function calling(): static
    {
        return $this->state(fn () => [
            'status' => QueueStatus::Calling,
            'called_at' => now(),
        ]);
    }

    public function serving(): static
    {
        return $this->state(fn () => [
            'status' => QueueStatus::Serving,
            'called_at' => now()->subMinutes(5),
            'served_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => QueueStatus::Completed,
            'called_at' => now()->subMinutes(25),
            'served_at' => now()->subMinutes(20),
            'completed_at' => now(),
        ]);
    }

    public function skipped(): static
    {
        return $this->state(fn () => [
            'status' => QueueStatus::Skipped,
            'called_at' => now()->subMinutes(10),
        ]);
    }
}
