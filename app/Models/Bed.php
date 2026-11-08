<?php

namespace App\Models;

use Database\Factories\BedFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $room_name
 * @property string $bed_number
 * @property string $class
 * @property float $daily_rate
 * @property string $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'room_name',
    'bed_number',
    'class',
    'daily_rate',
    'status',
    'notes',
])]
class Bed extends Model
{
    /** @use HasFactory<BedFactory> */
    use HasFactory, LogsActivity;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
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
     * @param  Builder<Bed>  $query
     * @return Builder<Bed>
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', 'available');
    }
}
