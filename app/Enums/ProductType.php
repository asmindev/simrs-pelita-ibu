<?php

namespace App\Enums;

enum ProductType: string
{
    case Drug = 'drug';
    case MedicalSupply = 'medical_supply';
    case Reagent = 'reagent';
    case General = 'general';

    public function label(): string
    {
        return match ($this) {
            self::Drug => 'Obat',
            self::MedicalSupply => 'Alkes & BMHP',
            self::Reagent => 'Reagen & Penunjang',
            self::General => 'Produk Umum',
        };
    }
}
