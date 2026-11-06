<?php

namespace App\Enums;

enum UnitType: string
{
    case Outpatient = 'outpatient';
    case Inpatient = 'inpatient';
    case Emergency = 'emergency';
    case Laboratory = 'laboratory';
    case Radiology = 'radiology';
    case Pharmacy = 'pharmacy';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Outpatient => 'Rawat Jalan',
            self::Inpatient => 'Rawat Inap',
            self::Emergency => 'Gawat Darurat',
            self::Laboratory => 'Laboratorium',
            self::Radiology => 'Radiologi',
            self::Pharmacy => 'Farmasi',
            self::Other => 'Lainnya',
        };
    }
}
