<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int $patient_id
 * @property string $reason
 * @property Carbon $granted_at
 * @property Carbon $expires_at
 * @property Carbon|null $revoked_at
 * @property int|null $reviewed_by_id
 * @property Carbon|null $reviewed_at
 * @property string|null $review_notes
 */
#[Fillable([
    'user_id',
    'patient_id',
    'reason',
    'granted_at',
    'expires_at',
    'revoked_at',
    'reviewed_by_id',
    'reviewed_at',
    'review_notes',
])]
class BreakGlassGrant extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'granted_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null && $this->expires_at->isFuture();
    }

    /**
     * @param  Builder<BreakGlassGrant>  $query
     * @return Builder<BreakGlassGrant>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('revoked_at')->where('expires_at', '>', now());
    }
}
