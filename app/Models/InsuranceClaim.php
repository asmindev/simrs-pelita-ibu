<?php

namespace App\Models;

use Database\Factories\InsuranceClaimFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $invoice_id
 * @property int $guarantor_id
 * @property string|null $claim_number
 * @property string $status
 * @property float $claimed_amount
 * @property float $approved_amount
 * @property string|null $rejection_reason
 * @property string|null $notes
 * @property Carbon $submitted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'invoice_id',
    'guarantor_id',
    'claim_number',
    'status',
    'claimed_amount',
    'approved_amount',
    'rejection_reason',
    'notes',
    'submitted_at',
])]
class InsuranceClaim extends Model
{
    /** @use HasFactory<InsuranceClaimFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'claimed_amount' => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('cashier')
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return BelongsTo<Guarantor, $this>
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class);
    }
}
