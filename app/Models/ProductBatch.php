<?php

namespace App\Models;

use Database\Factories\ProductBatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $product_id
 * @property string $batch_number
 * @property Carbon $expiry_date
 * @property int $initial_quantity
 * @property int $current_quantity
 * @property int $buy_price
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Product $product
 */
#[Fillable([
    'product_id',
    'batch_number',
    'expiry_date',
    'initial_quantity',
    'current_quantity',
    'buy_price',
    'is_active',
])]
class ProductBatch extends Model
{
    /** @use HasFactory<ProductBatchFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'expiry_date' => 'date',
            'initial_quantity' => 'integer',
            'current_quantity' => 'integer',
            'buy_price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('pharmacy');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return HasMany<Dispensing, $this>
     */
    public function dispensings(): HasMany
    {
        return $this->hasMany(Dispensing::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * @return HasMany<StockQuant, $this>
     */
    public function stockQuants(): HasMany
    {
        return $this->hasMany(StockQuant::class);
    }

    /**
     * @return HasMany<StockValuationLayer, $this>
     */
    public function valuationLayers(): HasMany
    {
        return $this->hasMany(StockValuationLayer::class);
    }

    /**
     * Scope FEFO: first expired first out, only available non-expired batches.
     *
     * @param  Builder<ProductBatch>  $query
     * @return Builder<ProductBatch>
     */
    public function scopeFefoAvailable(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('current_quantity', '>', 0)
            ->whereDate('expiry_date', '>=', Carbon::today())
            ->orderBy('expiry_date', 'asc');
    }
}
