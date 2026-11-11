<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class HospitalSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_name',
        'app_tagline',
        'logo_path',
        'favicon_path',
        'hospital_name',
        'hospital_code',
        'license_number',
        'phone',
        'email',
        'address',
        'city',
        'province',
        'postal_code',
        'print_header',
        'print_footer',
    ];

    protected $appends = [
        'logo_url',
        'favicon_url',
    ];

    public static function instance(): self
    {
        return static::firstOrCreate([], [
            'app_name' => config('app.name', 'SIMRS Pelita Ibu'),
            'app_tagline' => 'Sistem Informasi Manajemen Rumah Sakit',
            'hospital_name' => 'RS Pelita Ibu',
            'phone' => '(0411) 872222',
            'email' => 'info@pelita-ibu.ac.id',
            'city' => 'Makassar',
            'province' => 'Sulawesi Selatan',
        ]);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    public function getFaviconUrlAttribute(): ?string
    {
        if (! $this->favicon_path) {
            return null;
        }

        return Storage::disk('public')->url($this->favicon_path);
    }
}
