<?php

namespace App\Models;

use App\Enums\DiagnosisType;
use Database\Factories\DiagnosisFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $encounter_id
 * @property int $patient_id
 * @property string $icd10_code
 * @property string $icd10_name
 * @property DiagnosisType $type
 * @property string|null $notes
 * @property int $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'encounter_id',
    'patient_id',
    'icd10_code',
    'icd10_name',
    'type',
    'notes',
    'created_by',
])]
class Diagnosis extends Model
{
    /** @use HasFactory<DiagnosisFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => DiagnosisType::class,
        ];
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
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @param  Builder<Diagnosis>  $query
     * @return Builder<Diagnosis>
     */
    public function scopePrimary(Builder $query): Builder
    {
        return $query->where('type', DiagnosisType::Primary);
    }

    /**
     * @param  Builder<Diagnosis>  $query
     * @return Builder<Diagnosis>
     */
    public function scopeSecondary(Builder $query): Builder
    {
        return $query->where('type', DiagnosisType::Secondary);
    }
}
