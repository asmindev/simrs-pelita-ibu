<?php

namespace App\Models;

use Database\Factories\DrugBatchFactory;
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
 * @property int $drug_id
 * @property string $batch_number
 * @property Carbon $expiry_date
 * @property int $initial_quantity
 * @property int $current_quantity
 * @property int $buy_price
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Drug $drug
 */
#[Fillable([
    'drug_id',
    'batch_number',
    'expiry_date',
    'initial_quantity',
    'current_quantity',
    'buy_price',
    'is_active',
])]
class DrugBatch extends Model
{
    /** @use HasFactory<DrugBatchFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
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
     * @return BelongsTo<Drug, $this>
     */
    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
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
     * Scope FEFO: first expired first out, only available non-expired batches.
     *
     * @param  Builder<DrugBatch>  $query
     * @return Builder<DrugBatch>
     */
    public function scopeFefoAvailable(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('current_quantity', '>', 0)
            ->whereDate('expiry_date', '>=', Carbon::today())
            ->orderBy('expiry_date', 'asc');
    }
}
