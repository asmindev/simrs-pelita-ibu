<?php

namespace App\Models;

use Database\Factories\PrescriptionFactory;
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
 * @property string $prescription_number
 * @property int $encounter_id
 * @property int $patient_id
 * @property int $doctor_id
 * @property int $unit_id
 * @property string $status
 * @property string|null $notes
 * @property string|null $verification_notes
 * @property int|null $pharmacist_id
 * @property Carbon|null $verified_at
 * @property Carbon|null $dispensed_at
 * @property Carbon|null $cancelled_at
 * @property string|null $cancel_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Encounter $encounter
 * @property Patient $patient
 * @property Doctor $doctor
 * @property Unit $unit
 * @property User|null $pharmacist
 */
#[Fillable([
    'prescription_number',
    'encounter_id',
    'patient_id',
    'doctor_id',
    'unit_id',
    'status',
    'notes',
    'verification_notes',
    'pharmacist_id',
    'verified_at',
    'dispensed_at',
    'cancelled_at',
    'cancel_reason',
])]
class Prescription extends Model
{
    /** @use HasFactory<PrescriptionFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'dispensed_at' => 'datetime',
            'cancelled_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function pharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }

    /**
     * @return HasMany<PrescriptionItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
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

    /**
     * @param  Builder<Prescription>  $query
     * @return Builder<Prescription>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['submitted', 'verified']);
    }

    /**
     * @param  Builder<Prescription>  $query
     * @return Builder<Prescription>
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function (Builder $builder) use ($search): void {
            $builder->where('prescription_number', 'like', "%{$search}%")
                ->orWhereHas('patient', function (Builder $patientQuery) use ($search): void {
                    $patientQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('medical_record_number', 'like', "%{$search}%");
                });
        });
    }
}
