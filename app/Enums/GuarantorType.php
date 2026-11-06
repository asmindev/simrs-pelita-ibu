<?php

namespace App\Enums;

enum GuarantorType: string
{
    case Bpjs = 'bpjs';
    case General = 'general';
    case Insurance = 'insurance';
    case Company = 'company';

    public function label(): string
    {
        return match ($this) {
            self::Bpjs => 'BPJS Kesehatan',
            self::General => 'Umum / Pribadi',
            self::Insurance => 'Asuransi Swasta',
            self::Company => 'Perusahaan',
        };
    }
}
