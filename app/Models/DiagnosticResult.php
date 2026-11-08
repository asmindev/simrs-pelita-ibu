<?php

namespace App\Models;

use Database\Factories\DiagnosticResultFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $diagnostic_order_id
 * @property int|null $diagnostic_order_item_id
 * @property string $parameter_name
 * @property string $result_value
 * @property string|null $reference_range
 * @property string|null $unit
 * @property bool $is_critical
 * @property string|null $interpretation
 * @property string|null $attachment_path
 * @property int $performed_by
 * @property Carbon $performed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'diagnostic_order_id',
    'diagnostic_order_item_id',
    'parameter_name',
    'result_value',
    'reference_range',
    'unit',
    'is_critical',
    'interpretation',
    'attachment_path',
    'performed_by',
    'performed_at',
])]
class DiagnosticResult extends Model
{
    /** @use HasFactory<DiagnosticResultFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_critical' => 'boolean',
            'performed_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('diagnostics')
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * @return BelongsTo<DiagnosticOrder, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(DiagnosticOrder::class, 'diagnostic_order_id');
    }

    /**
     * @return BelongsTo<DiagnosticOrderItem, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(DiagnosticOrderItem::class, 'diagnostic_order_item_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
