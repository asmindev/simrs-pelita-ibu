<?php

namespace App\Models;

use Database\Factories\DrugFactory;
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
 * @property string $code
 * @property string $name
 * @property int $drug_category_id
 * @property string $form
 * @property string $strength
 * @property string $unit_of_measure
 * @property int $price
 * @property string $manufacturer
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property DrugCategory $category
 */
#[Fillable(['code', 'name', 'drug_category_id', 'form', 'strength', 'unit_of_measure', 'price', 'manufacturer', 'is_active'])]
class Drug extends Model
{
    /** @use HasFactory<DrugFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'drug_category_id' => 'integer',
            'price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('master-data');
    }

    /**
     * @return BelongsTo<DrugCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DrugCategory::class, 'drug_category_id');
    }

    /**
     * @return BelongsTo<DrugCategory, $this>
     */
    public function drugCategory(): BelongsTo
    {
        return $this->category();
    }

    /**
     * @return HasMany<DrugBatch, $this>
     */
    public function batches(): HasMany
    {
        return $this->hasMany(DrugBatch::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * @param  Builder<Drug>  $query
     * @return Builder<Drug>
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function (Builder $builder) use ($search): void {
            $builder->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('manufacturer', 'like', "%{$search}%");
        });
    }
}
