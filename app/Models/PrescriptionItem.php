<?php

namespace App\Models;

use Database\Factories\PrescriptionItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $prescription_id
 * @property int $drug_id
 * @property string $dosage
 * @property string $frequency
 * @property string $route
 * @property int|null $duration_days
 * @property int $quantity
 * @property int $dispensed_quantity
 * @property string|null $instructions
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Prescription $prescription
 * @property Drug $drug
 */
#[Fillable([
    'prescription_id',
    'drug_id',
    'dosage',
    'frequency',
    'route',
    'duration_days',
    'quantity',
    'dispensed_quantity',
    'instructions',
    'status',
])]
class PrescriptionItem extends Model
{
    /** @use HasFactory<PrescriptionItemFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'quantity' => 'integer',
            'dispensed_quantity' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Prescription, $this>
     */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
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
     * @return HasMany<StockReturn, $this>
     */
    public function returns(): HasMany
    {
        return $this->hasMany(StockReturn::class);
    }
}
