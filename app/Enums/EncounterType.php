<?php

namespace App\Enums;

enum EncounterType: string
{
    case Outpatient = 'outpatient';
    case Emergency = 'emergency';

    public function label(): string
    {
        return match ($this) {
            self::Outpatient => 'Rawat Jalan',
            self::Emergency => 'IGD',
        };
    }
}
