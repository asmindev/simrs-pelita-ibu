<?php

namespace Database\Factories;

use App\Models\DiagnosticOrder;
use App\Models\DiagnosticOrderItem;
use App\Models\DiagnosticResult;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiagnosticResult>
 */
class DiagnosticResultFactory extends Factory
{
    public function definition(): array
    {
        return [
            'diagnostic_order_id' => DiagnosticOrder::factory(),
            'diagnostic_order_item_id' => DiagnosticOrderItem::factory(),
            'parameter_name' => 'Hemoglobin',
            'result_value' => '14.2',
            'reference_range' => '13.0 - 17.5',
            'unit' => 'g/dL',
            'is_critical' => false,
            'interpretation' => 'Normal',
            'attachment_path' => null,
            'performed_by' => User::factory(),
            'performed_at' => now(),
        ];
    }

    public function critical(): static
    {
        return $this->state(fn (array $attributes): array => [
            'parameter_name' => 'Trombosit',
            'result_value' => '15.000',
            'reference_range' => '150.000 - 450.000',
            'unit' => '/uL',
            'is_critical' => true,
            'interpretation' => 'Trombositopenia berat, risiko pendarahan spontan.',
        ]);
    }
}
