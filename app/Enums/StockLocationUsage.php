<?php

namespace App\Enums;

enum StockLocationUsage: string
{
    case Internal = 'internal';
    case Supplier = 'supplier';
    case Customer = 'customer';
    case Inventory = 'inventory';

    public function label(): string
    {
        return match ($this) {
            self::Internal => 'Lokasi Internal',
            self::Supplier => 'Supplier / Vendor',
            self::Customer => 'Pasien / Konsumen',
            self::Inventory => 'Penyesuaian / Loss',
        };
    }
}
