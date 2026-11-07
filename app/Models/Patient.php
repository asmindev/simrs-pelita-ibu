<?php

namespace App\Models;

use App\Enums\PatientGender;
use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $medical_record_number
 * @property string|null $nik
 * @property string $name
 * @property PatientGender $gender
 * @property Carbon $birth_date
 * @property string|null $address
 * @property string|null $phone
 * @property bool $is_active
 * @property int|null $merged_to_patient_id
 * @property Carbon|null $merged_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'medical_record_number',
    'nik',
    'name',
    'gender',
    'birth_date',
    'address',
    'phone',
    'is_active',
    'merged_to_patient_id',
    'merged_at',
])]
class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gender' => PatientGender::class,
            'birth_date' => 'date',
            'is_active' => 'boolean',
            'merged_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function mergedTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'merged_to_patient_id');
    }

    /**
     * @return HasMany<Patient, $this>
     */
    public function mergedFrom(): HasMany
    {
        return $this->hasMany(self::class, 'merged_to_patient_id');
    }

    /**
     * @return HasMany<Encounter, $this>
     */
    public function encounters(): HasMany
    {
        return $this->hasMany(Encounter::class);
    }

    /**
     * @return HasMany<Assessment, $this>
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    /**
     * @return HasMany<Diagnosis, $this>
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * @return HasMany<Procedure, $this>
     */
    public function procedures(): HasMany
    {
        return $this->hasMany(Procedure::class);
    }

    /**
     * @return HasMany<SensitiveNote, $this>
     */
    public function sensitiveNotes(): HasMany
    {
        return $this->hasMany(SensitiveNote::class);
    }

    /**
     * @return HasMany<ClinicalReport, $this>
     */
    public function clinicalReports(): HasMany
    {
        return $this->hasMany(ClinicalReport::class);
    }

    /**
     * @param  Builder<Patient>  $query
     * @return Builder<Patient>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<Patient>  $query
     * @return Builder<Patient>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $query) use ($term): void {
            $query->where('name', 'like', "%{$term}%")
                ->orWhere('medical_record_number', 'like', "%{$term}%")
                ->orWhere('nik', 'like', "%{$term}%");
        });
    }
}
