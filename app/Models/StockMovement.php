<?php

namespace App\Models;

use Database\Factories\StockMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string|null $reference_number
 * @property int $product_id
 * @property int|null $product_batch_id
 * @property int|null $source_location_id
 * @property int|null $destination_location_id
 * @property string $type
 * @property int $quantity
 * @property int $balance_before
 * @property int $balance_after
 * @property int $unit_cost
 * @property int $total_value
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property string|null $origin
 * @property string $state
 * @property string|null $reason
 * @property int $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Product $product
 * @property ProductBatch|null $productBatch
 * @property StockLocation|null $sourceLocation
 * @property StockLocation|null $destinationLocation
 * @property User $user
 */
#[Fillable([
    'reference_number',
    'product_id',
    'product_batch_id',
    'source_location_id',
    'destination_location_id',
    'type',
    'quantity',
    'balance_before',
    'balance_after',
    'unit_cost',
    'total_value',
    'reference_type',
    'reference_id',
    'origin',
    'state',
    'reason',
    'user_id',
])]
class StockMovement extends Model
{
    /** @use HasFactory<StockMovementFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'product_batch_id' => 'integer',
            'source_location_id' => 'integer',
            'destination_location_id' => 'integer',
            'quantity' => 'integer',
            'balance_before' => 'integer',
            'balance_after' => 'integer',
            'unit_cost' => 'integer',
            'total_value' => 'integer',
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
     * @return BelongsTo<ProductBatch, $this>
     */
    public function productBatch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class);
    }

    /**
     * @return BelongsTo<StockLocation, $this>
     */
    public function sourceLocation(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'source_location_id');
    }

    /**
     * @return BelongsTo<StockLocation, $this>
     */
    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'destination_location_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<StockValuationLayer, $this>
     */
    public function valuationLayers(): HasMany
    {
        return $this->hasMany(StockValuationLayer::class);
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
