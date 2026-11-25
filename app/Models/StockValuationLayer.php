<?php

namespace App\Models;

use Database\Factories\StockValuationLayerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $product_batch_id
 * @property int $stock_movement_id
 * @property int|null $stock_location_id
 * @property int $quantity
 * @property int $remaining_qty
 * @property int $unit_cost
 * @property int $value
 * @property int $remaining_value
 * @property string|null $reference
 * @property string|null $description
 * @property int $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Product $product
 * @property ProductBatch|null $productBatch
 * @property StockMovement $stockMovement
 * @property StockLocation|null $location
 * @property User $user
 */
#[Fillable([
    'product_id',
    'product_batch_id',
    'stock_movement_id',
    'stock_location_id',
    'quantity',
    'remaining_qty',
    'unit_cost',
    'value',
    'remaining_value',
    'reference',
    'description',
    'user_id',
])]
class StockValuationLayer extends Model
{
    /** @use HasFactory<StockValuationLayerFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'product_batch_id' => 'integer',
            'stock_movement_id' => 'integer',
            'stock_location_id' => 'integer',
            'quantity' => 'integer',
            'remaining_qty' => 'integer',
            'unit_cost' => 'integer',
            'value' => 'integer',
            'remaining_value' => 'integer',
            'user_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductBatch, $this>
     */
    public function productBatch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class);
    }

    /**
     * @return BelongsTo<StockMovement, $this>
     */
    public function stockMovement(): BelongsTo
    {
        return $this->belongsTo(StockMovement::class);
    }

    /**
     * @return BelongsTo<StockLocation, $this>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'stock_location_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
