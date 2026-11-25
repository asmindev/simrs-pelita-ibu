<?php

namespace App\Models;

use Database\Factories\StockReturnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $prescription_id
 * @property int $prescription_item_id
 * @property int $product_batch_id
 * @property int $quantity
 * @property string $return_reason
 * @property int $returned_by
 * @property Carbon $returned_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Prescription $prescription
 * @property PrescriptionItem $prescriptionItem
 * @property ProductBatch $productBatch
 * @property User $returnedBy
 */
#[Fillable([
    'prescription_id',
    'prescription_item_id',
    'product_batch_id',
    'quantity',
    'return_reason',
    'returned_by',
    'returned_at',
])]
class StockReturn extends Model
{
    /** @use HasFactory<StockReturnFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_batch_id' => 'integer',
            'quantity' => 'integer',
            'returned_at' => 'datetime',
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
     * @return BelongsTo<Prescription, $this>
     */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /**
     * @return BelongsTo<PrescriptionItem, $this>
     */
    public function prescriptionItem(): BelongsTo
    {
        return $this->belongsTo(PrescriptionItem::class);
    }

    /**
     * @return BelongsTo<ProductBatch, $this>
     */
    public function productBatch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function returnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }
}
