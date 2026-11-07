<?php

namespace App\Enums;

enum TariffCategory: string
{
    case Consultation = 'consultation';
    case Procedure = 'procedure';
    case Laboratory = 'laboratory';
    case Radiology = 'radiology';
    case Administration = 'administration';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Consultation => 'Konsultasi',
            self::Procedure => 'Tindakan Medis',
            self::Laboratory => 'Laboratorium',
            self::Radiology => 'Radiologi',
            self::Administration => 'Administrasi',
            self::Other => 'Lainnya',
        };
    }
}
