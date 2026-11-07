<?php

namespace App\Enums;

enum SensitiveCategory: string
{
    case Psychiatry = 'psychiatry';
    case Hiv = 'hiv';
    case SubstanceUse = 'substance_use';

    public function label(): string
    {
        return match ($this) {
            self::Psychiatry => 'Kesehatan Jiwa / Psikiatri',
            self::Hiv => 'HIV / IMS',
            self::SubstanceUse => 'Penyalahgunaan Napza',
        };
    }
}
