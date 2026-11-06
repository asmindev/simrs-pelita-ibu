<?php

namespace App\Models;

use App\Enums\PatientGender;
use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
        ];
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
