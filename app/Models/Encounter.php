<?php

namespace App\Models;

use App\Enums\EncounterStatus;
use App\Enums\EncounterType;
use Database\Factories\EncounterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $encounter_number
 * @property int $patient_id
 * @property int $unit_id
 * @property int|null $doctor_id
 * @property EncounterType $type
 * @property EncounterStatus $status
 * @property int $guarantor_id
 * @property Carbon $arrived_at
 * @property Carbon|null $consultation_started_at
 * @property Carbon|null $consultation_ended_at
 * @property string|null $cancellation_reason
 * @property Carbon|null $cancelled_at
 * @property int|null $cancelled_by
 * @property string|null $notes
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'encounter_number',
    'patient_id',
    'unit_id',
    'doctor_id',
    'type',
    'status',
    'guarantor_id',
    'arrived_at',
    'consultation_started_at',
    'consultation_ended_at',
    'cancellation_reason',
    'cancelled_at',
    'cancelled_by',
    'notes',
    'created_by',
])]
class Encounter extends Model
{
    /** @use HasFactory<EncounterFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => EncounterType::class,
            'status' => EncounterStatus::class,
            'arrived_at' => 'datetime',
            'consultation_started_at' => 'datetime',
            'consultation_ended_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * @return BelongsTo<Guarantor, $this>
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class);
    }

    /**
     * @return HasOne<Queue, $this>
     */
    public function queue(): HasOne
    {
        return $this->hasOne(Queue::class);
    }

    /**
     * @return HasOne<InsuranceCoverage, $this>
     */
    public function insuranceCoverage(): HasOne
    {
        return $this->hasOne(InsuranceCoverage::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @param  Builder<Encounter>  $query
     * @return Builder<Encounter>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            EncounterStatus::Arrived,
            EncounterStatus::InConsultation,
        ]);
    }

    /**
     * @param  Builder<Encounter>  $query
     * @return Builder<Encounter>
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('arrived_at', today());
    }

    /**
     * @param  Builder<Encounter>  $query
     * @return Builder<Encounter>
     */
    public function scopeForUnit(Builder $query, int $unitId): Builder
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * @param  Builder<Encounter>  $query
     * @return Builder<Encounter>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $query) use ($term): void {
            $query->where('encounter_number', 'like', "%{$term}%")
                ->orWhereHas('patient', function (Builder $query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('medical_record_number', 'like', "%{$term}%")
                        ->orWhere('nik', 'like', "%{$term}%");
                });
        });
    }
}
