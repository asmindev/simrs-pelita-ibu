<?php

namespace App\Enums;

enum DiagnosisType: string
{
    case Primary = 'primary';
    case Secondary = 'secondary';

    public function label(): string
    {
        return match ($this) {
            self::Primary => 'Diagnosis Utama',
            self::Secondary => 'Diagnosis Sekunder',
        };
    }
}
