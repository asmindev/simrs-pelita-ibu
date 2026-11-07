<?php

namespace App\Models;

use App\Enums\AssessmentType;
use Database\Factories\AssessmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $encounter_id
 * @property int $patient_id
 * @property int $created_by
 * @property AssessmentType $type
 * @property string|null $subjective
 * @property string|null $objective
 * @property string|null $assessment
 * @property string|null $plan
 * @property array<string, mixed>|null $vital_signs
 * @property string|null $triage_level
 * @property string|null $allergies
 * @property bool $is_final
 * @property Carbon|null $finalized_at
 * @property int|null $finalized_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'encounter_id',
    'patient_id',
    'created_by',
    'type',
    'subjective',
    'objective',
    'assessment',
    'plan',
    'vital_signs',
    'triage_level',
    'allergies',
    'is_final',
    'finalized_at',
    'finalized_by',
])]
class Assessment extends Model
{
    /** @use HasFactory<AssessmentFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AssessmentType::class,
            'vital_signs' => 'array',
            'is_final' => 'boolean',
            'finalized_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    /**
     * @return HasMany<RecordAddendum, $this>
     */
    public function addenda(): HasMany
    {
        return $this->hasMany(RecordAddendum::class);
    }

    /**
     * @param  Builder<Assessment>  $query
     * @return Builder<Assessment>
     */
    public function scopeFinal(Builder $query): Builder
    {
        return $query->where('is_final', true);
    }

    /**
     * @param  Builder<Assessment>  $query
     * @return Builder<Assessment>
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('is_final', false);
    }
}
