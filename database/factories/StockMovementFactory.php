<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(10, 50);
        $before = fake()->numberBetween(50, 100);

        return [
            'product_id' => Product::factory(),
            'product_batch_id' => ProductBatch::factory(),
            'type' => 'in',
            'quantity' => $qty,
            'balance_before' => $before,
            'balance_after' => $before + $qty,
            'reference_type' => null,
            'reference_id' => null,
            'reason' => 'Penerimaan stok obat baru.',
            'user_id' => User::factory(),
        ];
    }
}
