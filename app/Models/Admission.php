<?php

namespace App\Models;

use Database\Factories\AdmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $admission_number
 * @property int $encounter_id
 * @property int $patient_id
 * @property int $doctor_id
 * @property Carbon $admitted_at
 * @property Carbon|null $discharged_at
 * @property string|null $initial_diagnosis
 * @property string|null $discharge_diagnosis
 * @property string|null $discharge_summary
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'admission_number',
    'encounter_id',
    'patient_id',
    'doctor_id',
    'admitted_at',
    'discharged_at',
    'initial_diagnosis',
    'discharge_diagnosis',
    'discharge_summary',
    'status',
])]
class Admission extends Model
{
    /** @use HasFactory<AdmissionFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'admitted_at' => 'datetime',
            'discharged_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('inpatient')
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
     * @return HasMany<BedAssignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(BedAssignment::class);
    }

    /**
     * @return HasOne<BedAssignment, $this>
     */
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(BedAssignment::class)->whereNull('released_at')->latest('id');
    }

    /**
     * @return HasMany<InpatientDailyNote, $this>
     */
    public function dailyNotes(): HasMany
    {
        return $this->hasMany(InpatientDailyNote::class);
    }

    /**
     * @param  Builder<Admission>  $query
     * @return Builder<Admission>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * @param  Builder<Admission>  $query
     * @return Builder<Admission>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term): void {
            $q->where('admission_number', 'like', "%{$term}%")
                ->orWhereHas('patient', function (Builder $pq) use ($term): void {
                    $pq->where('name', 'like', "%{$term}%")
                        ->orWhere('medical_record_number', 'like', "%{$term}%");
                });
        });
    }
}
