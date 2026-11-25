<?php

namespace App\Models;

use App\Enums\StockLocationUsage;
use Database\Factories\StockLocationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property StockLocationUsage $usage
 * @property string|null $description
 * @property bool $is_default_warehouse
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'code',
    'name',
    'usage',
    'description',
    'is_default_warehouse',
    'is_active',
])]
class StockLocation extends Model
{
    /** @use HasFactory<StockLocationFactory> */
    use HasFactory;

    public const string CODE_DEFAULT_WAREHOUSE = 'WH/STOCK';

    public const string CODE_OPD_DEPO = 'OPD/STOCK';

    public const string CODE_IPD_DEPO = 'IPD/STOCK';

    public const string CODE_QUARANTINE = 'WH/QUARANTINE';

    public const string CODE_VENDORS = 'PARTNER/VENDORS';

    public const string CODE_CUSTOMERS = 'PARTNER/CUSTOMERS';

    public const string CODE_INVENTORY_LOSS = 'VIRTUAL/LOSS';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'usage' => StockLocationUsage::class,
            'is_default_warehouse' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<StockQuant, $this>
     */
    public function quants(): HasMany
    {
        return $this->hasMany(StockQuant::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function outgoingMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'source_location_id');
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function incomingMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'destination_location_id');
    }

    /**
     * @return HasMany<StockValuationLayer, $this>
     */
    public function valuationLayers(): HasMany
    {
        return $this->hasMany(StockValuationLayer::class);
    }

    /**
     * @param  Builder<StockLocation>  $query
     * @return Builder<StockLocation>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term): void {
            $q->where('code', 'like', "%{$term}%")
                ->orWhere('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * @param  Builder<StockLocation>  $query
     * @return Builder<StockLocation>
     */
    public function scopeInternal(Builder $query): Builder
    {
        return $query->where('usage', StockLocationUsage::Internal->value)
            ->where('is_active', true);
    }

    /**
     * @param  Builder<StockLocation>  $query
     * @return Builder<StockLocation>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
