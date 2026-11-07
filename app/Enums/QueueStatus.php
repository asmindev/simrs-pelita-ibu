<?php

namespace App\Enums;

enum QueueStatus: string
{
    case Waiting = 'waiting';
    case Calling = 'calling';
    case Serving = 'serving';
    case Completed = 'completed';
    case Skipped = 'skipped';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Waiting => 'Menunggu',
            self::Calling => 'Dipanggil',
            self::Serving => 'Dilayani',
            self::Completed => 'Selesai',
            self::Skipped => 'Dilewati',
            self::Cancelled => 'Batal',
        };
    }
}
