<?php

namespace App\Enums;

enum StockMoveType: string
{
    case In = 'in';
    case Out = 'out';
    case Transfer = 'transfer';
    case Dispensing = 'dispensing';
    case Adjustment = 'adjustment';
    case Opname = 'opname';
    case Return = 'return';

    public function label(): string
    {
        return match ($this) {
            self::In => 'Penerimaan Masuk',
            self::Out => 'Pengeluaran',
            self::Transfer => 'Transfer Lokasi',
            self::Dispensing => 'Dispensing Resep',
            self::Adjustment => 'Penyesuaian',
            self::Opname => 'Stok Opname',
            self::Return => 'Retur Pasien',
        };
    }

    public function referencePrefix(): string
    {
        return match ($this) {
            self::In => 'WH/IN',
            self::Out, self::Dispensing => 'WH/OUT',
            self::Transfer => 'WH/INT',
            self::Adjustment, self::Opname => 'WH/ADJ',
            self::Return => 'WH/RET',
        };
    }
}
