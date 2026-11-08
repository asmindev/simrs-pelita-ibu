<?php

namespace App\Models;

use Database\Factories\BedAssignmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $admission_id
 * @property int $bed_id
 * @property Carbon $assigned_at
 * @property Carbon|null $released_at
 * @property int $assigned_by
 * @property string|null $reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'admission_id',
    'bed_id',
    'assigned_at',
    'released_at',
    'assigned_by',
    'reason',
])]
class BedAssignment extends Model
{
    /** @use HasFactory<BedAssignmentFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'released_at' => 'datetime',
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
     * @return BelongsTo<Admission, $this>
     */
    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * @return BelongsTo<Bed, $this>
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
