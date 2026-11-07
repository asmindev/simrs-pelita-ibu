<?php

namespace App\Models;

use Database\Factories\InsuranceCoverageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $encounter_id
 * @property int $guarantor_id
 * @property string|null $card_number
 * @property string|null $claim_number
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'encounter_id',
    'guarantor_id',
    'card_number',
    'claim_number',
    'notes',
])]
class InsuranceCoverage extends Model
{
    /** @use HasFactory<InsuranceCoverageFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Encounter, $this>
     */
    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    /**
     * @return BelongsTo<Guarantor, $this>
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class);
    }
}
