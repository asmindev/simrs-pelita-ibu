<?php

namespace App\Models;

use Database\Factories\DiagnosticOrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $diagnostic_order_id
 * @property int|null $tariff_id
 * @property string $test_name
 * @property string $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'diagnostic_order_id',
    'tariff_id',
    'test_name',
    'status',
    'notes',
])]
class DiagnosticOrderItem extends Model
{
    /** @use HasFactory<DiagnosticOrderItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<DiagnosticOrder, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(DiagnosticOrder::class, 'diagnostic_order_id');
    }

    /**
     * @return BelongsTo<Tariff, $this>
     */
    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    /**
     * @return HasMany<DiagnosticResult, $this>
     */
    public function results(): HasMany
    {
        return $this->hasMany(DiagnosticResult::class, 'diagnostic_order_item_id');
    }
}
