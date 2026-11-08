<?php

namespace Database\Factories;

use App\Models\DiagnosticOrder;
use App\Models\DiagnosticOrderItem;
use App\Models\Tariff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiagnosticOrderItem>
 */
class DiagnosticOrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'diagnostic_order_id' => DiagnosticOrder::factory(),
            'tariff_id' => Tariff::factory(),
            'test_name' => fake()->words(2, true),
            'status' => 'pending',
            'notes' => null,
        ];
    }
}
