<?php

namespace App\Models;

use Database\Factories\StockQuantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $stock_location_id
 * @property int $product_id
 * @property int $product_batch_id
 * @property int $quantity
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property StockLocation $location
 * @property Product $product
 * @property ProductBatch $productBatch
 */
#[Fillable([
    'stock_location_id',
    'product_id',
    'product_batch_id',
    'quantity',
])]
class StockQuant extends Model
{
    /** @use HasFactory<StockQuantFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock_location_id' => 'integer',
            'product_id' => 'integer',
            'product_batch_id' => 'integer',
            'quantity' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<StockLocation, $this>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'stock_location_id');
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
     * Scope FEFO available quants across non-quarantine internal locations.
     *
     * @param  Builder<StockQuant>  $query
     * @return Builder<StockQuant>
     */
    public function scopeFefoAvailable(Builder $query, ?int $locationId = null): Builder
    {
        return $query->where('quantity', '>', 0)
            ->when($locationId !== null, fn (Builder $q) => $q->where('stock_location_id', $locationId))
            ->when($locationId === null, function (Builder $q): void {
                $q->whereHas('location', function (Builder $lq): void {
                    $lq->internal()->where('code', '!=', StockLocation::CODE_QUARANTINE);
                });
            })
            ->whereHas('productBatch', function (Builder $bq): void {
                $bq->where('is_active', true)
                    ->whereDate('expiry_date', '>=', Carbon::today());
            });
    }
}
