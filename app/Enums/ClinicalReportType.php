<?php

namespace App\Enums;

enum ClinicalReportType: string
{
    case Surgery = 'surgery';
    case Birth = 'birth';
    case Death = 'death';

    public function label(): string
    {
        return match ($this) {
            self::Surgery => 'Laporan Operasi / Tindakan',
            self::Birth => 'Laporan Kelahiran',
            self::Death => 'Laporan Kematian',
        };
    }
}
