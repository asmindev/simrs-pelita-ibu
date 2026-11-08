<?php

namespace App\Models;

use Database\Factories\DiagnosticOrderFactory;
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
 * @property string $order_number
 * @property int $encounter_id
 * @property int $patient_id
 * @property int $doctor_id
 * @property int|null $unit_id
 * @property string $type
 * @property string $status
 * @property string|null $clinical_notes
 * @property Carbon|null $completed_at
 * @property int|null $completed_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_number',
    'encounter_id',
    'patient_id',
    'doctor_id',
    'unit_id',
    'type',
    'status',
    'clinical_notes',
    'completed_at',
    'completed_by',
])]
class DiagnosticOrder extends Model
{
    /** @use HasFactory<DiagnosticOrderFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
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
     * @return BelongsTo<Encounter, $this>
     */
    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * @return HasMany<DiagnosticOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(DiagnosticOrderItem::class);
    }

    /**
     * @return HasMany<DiagnosticResult, $this>
     */
    public function results(): HasMany
    {
        return $this->hasMany(DiagnosticResult::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * @param  Builder<DiagnosticOrder>  $query
     * @return Builder<DiagnosticOrder>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term): void {
            $q->where('order_number', 'like', "%{$term}%")
                ->orWhereHas('patient', function (Builder $pq) use ($term): void {
                    $pq->where('name', 'like', "%{$term}%")
                        ->orWhere('medical_record_number', 'like', "%{$term}%");
                });
        });
    }
}
