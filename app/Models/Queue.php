<?php

namespace App\Models;

use App\Enums\QueueStatus;
use Database\Factories\QueueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $encounter_id
 * @property int $unit_id
 * @property Carbon $queue_date
 * @property int $queue_number
 * @property string $queue_code
 * @property QueueStatus $status
 * @property Carbon|null $called_at
 * @property int|null $called_by
 * @property Carbon|null $served_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'encounter_id',
    'unit_id',
    'queue_date',
    'queue_number',
    'queue_code',
    'status',
    'called_at',
    'called_by',
    'served_at',
    'completed_at',
])]
class Queue extends Model
{
    /** @use HasFactory<QueueFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => QueueStatus::class,
            'queue_date' => 'date',
            'called_at' => 'datetime',
            'served_at' => 'datetime',
            'completed_at' => 'datetime',
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
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function calledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'called_by');
    }

    /**
     * @param  Builder<Queue>  $query
     * @return Builder<Queue>
     */
    public function scopeWaiting(Builder $query): Builder
    {
        return $query->where('status', QueueStatus::Waiting);
    }

    /**
     * @param  Builder<Queue>  $query
     * @return Builder<Queue>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            QueueStatus::Waiting,
            QueueStatus::Calling,
            QueueStatus::Serving,
        ]);
    }

    /**
     * @param  Builder<Queue>  $query
     * @return Builder<Queue>
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('queue_date', today());
    }

    /**
     * @param  Builder<Queue>  $query
     * @return Builder<Queue>
     */
    public function scopeForUnit(Builder $query, int $unitId): Builder
    {
        return $query->where('unit_id', $unitId);
    }
}
