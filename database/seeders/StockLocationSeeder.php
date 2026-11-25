<?php

namespace Database\Seeders;

use App\Enums\StockLocationUsage;
use App\Models\StockLocation;
use Illuminate\Database\Seeder;

class StockLocationSeeder extends Seeder
{
    /**
     * Seed default Odoo-style stock locations for SIMRS pharmacy inventory.
     *
     * @return array<string, StockLocation>
     */
    public static function ensureDefaults(): array
    {
        $definitions = [
            [
                'code' => StockLocation::CODE_DEFAULT_WAREHOUSE,
                'name' => 'Gudang Farmasi Pusat',
                'usage' => StockLocationUsage::Internal->value,
                'description' => 'Lokasi penyimpanan utama penerimaan PBF dan stok induk farmasi.',
                'is_default_warehouse' => true,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_OPD_DEPO,
                'name' => 'Depo Rawat Jalan',
                'usage' => StockLocationUsage::Internal->value,
                'description' => 'Lokasi layanan dispensing resep pasien rawat jalan.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_IPD_DEPO,
                'name' => 'Depo Rawat Inap & IGD',
                'usage' => StockLocationUsage::Internal->value,
                'description' => 'Lokasi distribusi obat untuk pasien rawat inap dan IGD.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_QUARANTINE,
                'name' => 'Karantina / Obat Rusak & ED',
                'usage' => StockLocationUsage::Internal->value,
                'description' => 'Lokasi karantina batch kedaluwarsa atau rusak sebelum pemusnahan.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_VENDORS,
                'name' => 'Supplier / PBF',
                'usage' => StockLocationUsage::Supplier->value,
                'description' => 'Lokasi virtual sumber penerimaan obat dari pemasok/distributor.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_CUSTOMERS,
                'name' => 'Pasien / Konsumen',
                'usage' => StockLocationUsage::Customer->value,
                'description' => 'Lokasi virtual tujuan penyerahan resep dan pemakaian pasien.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
            [
                'code' => StockLocation::CODE_INVENTORY_LOSS,
                'name' => 'Penyesuaian / Inventory Loss',
                'usage' => StockLocationUsage::Inventory->value,
                'description' => 'Lokasi virtual selisih stok opname, obat rusak, atau pemusnahan.',
                'is_default_warehouse' => false,
                'is_active' => true,
            ],
        ];

        $locations = [];

        foreach ($definitions as $data) {
            $locations[$data['code']] = StockLocation::query()->firstOrCreate(
                ['code' => $data['code']],
                $data,
            );
        }

        return $locations;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        self::ensureDefaults();
    }
}
