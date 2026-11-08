<?php

namespace App\Models;

use Database\Factories\InpatientDailyNoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $admission_id
 * @property string $note_type
 * @property array<string, mixed>|null $vital_signs
 * @property string|null $subjective
 * @property string|null $objective
 * @property string|null $assessment
 * @property string|null $plan
 * @property int $author_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'admission_id',
    'note_type',
    'vital_signs',
    'subjective',
    'objective',
    'assessment',
    'plan',
    'author_id',
])]
class InpatientDailyNote extends Model
{
    /** @use HasFactory<InpatientDailyNoteFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'vital_signs' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Admission, $this>
     */
    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
