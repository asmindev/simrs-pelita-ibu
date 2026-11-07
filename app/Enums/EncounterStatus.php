<?php

namespace App\Enums;

enum EncounterStatus: string
{
    case Arrived = 'arrived';
    case InConsultation = 'in_consultation';
    case Finished = 'finished';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Arrived => 'Menunggu',
            self::InConsultation => 'Sedang Dilayani',
            self::Finished => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
