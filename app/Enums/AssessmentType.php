<?php

namespace App\Enums;

enum AssessmentType: string
{
    case Initial = 'initial';
    case Soap = 'soap';
    case Triage = 'triage';
    case Nursing = 'nursing';

    public function label(): string
    {
        return match ($this) {
            self::Initial => 'Asesmen Awal',
            self::Soap => 'SOAP / Perkembangan',
            self::Triage => 'Triase IGD',
            self::Nursing => 'Asesmen Keperawatan',
        };
    }
}
