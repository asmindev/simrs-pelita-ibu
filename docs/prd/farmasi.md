# PRD — Farmasi & Inventaris

Status: IMPLEMENTED

## Tujuan

Mengelola pelayanan E-Resep (pembuatan untuk pasien sedang dilayani, telaah
apoteker, dispensing FEFO, retur obat) serta pengelolaan inventaris stok produk
per gudang/lokasi, batch kedaluwarsa, pergerakan stok, dan lapisan valuasi FIFO.

## Aktor

- Dokter (pembuatan E-Resep di EMR)
- Apoteker & Asisten Apoteker (pembuatan/telaah E-Resep, dispensing FEFO, retur, pengelolaan stok gudang)

## Scope

Termasuk:

- Pembuatan E-Resep untuk kunjungan berstatus `in_consultation` (_Sedang Dilayani_) melalui tab **E-Resep** di EMR maupun modal **Buat E-Resep** di `/pharmacy/prescriptions`.
- Daftar pilihan kunjungan aktif di Farmasi dibatasi ke pengunjung hari ini (atau rawat inap aktif) berstatus `in_consultation`.
- Verifikasi/telaah apoteker dan pembatalan resep.
- Dispensing otomatis berbasis alokasi **FEFO** (_First Expired First Out_) lintas lokasi internal aktif non-karantina, dengan sinkronisasi otomatis ke draft invoice Kasir.
- Retur obat yang sudah di-dispense beserta pemulihan stok batch.
- Manajemen Inventaris terpisah di grup menu **Inventaris**:
    - **Stok & Batch** (`/inventory/stock`): 1 baris per pasangan `(Gudang, Produk)`, halaman detail item (`/inventory/stock/{warehouse}/{product}`), modal **Tambah Stok Masuk** (menggunakan `Combobox` + `DatePicker`/`Calendar` shadcn), dan modal **Transfer / Pergerakan Stok** (`Transfer Gudang`, `Stok Masuk`, `Stok Keluar`, `Opname`) dengan preview stok gudang real-time.
    - **Gudang & Lokasi** (`/inventory/warehouses`): manajemen lokasi penyimpanan internal/virtual.
    - **Riwayat Pergerakan** (`/inventory/moves`): log mutasi stok standalone.
    - **Valuasi Stok** (`/inventory/valuation`): lapisan valuasi FIFO standalone.

Tidak termasuk:

- Pengadaan/pembelian ke supplier (PO/AP eksternal).
- Klaim penjamin eksternal.

## Alur utama

1. E-Resep dibuat oleh dokter/apoteker untuk pasien berstatus `in_consultation` (`status = 'submitted'`).
2. Apoteker membuka detail resep di `/pharmacy/prescriptions/{id}`, melakukan telaah (_Verifikasi & Setujui Resep_ → `verified`), lalu melakukan _Proses Dispensing Obat (FEFO)_ (`dispensed`).
3. Sistem memotong `stock_quants` & `product_batches` secara atomik dengan `lockForUpdate()`, mencatat `StockMovement` + `StockValuationLayer`, serta memperbarui draft invoice Kasir.
4. Untuk penerimaan stok baru atau transfer antar gudang/depo, petugas menggunakan modal _Tambah Stok Masuk_ atau _Transfer / Pergerakan Stok_ di `/inventory/stock`.

## Entitas

- `prescriptions`, `prescription_items`, `dispensings`, `stock_returns`
- `products`, `product_batches`, `stock_locations`, `stock_quants`, `stock_movements`, `stock_valuation_layers`

## Permission

```
pharmacy.prescription.view
pharmacy.prescription.create
pharmacy.prescription.verify
pharmacy.dispensing.create
pharmacy.dispensing.verify
pharmacy.stock.view
pharmacy.stock.adjust
pharmacy.stock.opname
pharmacy.return.create
pharmacy.label.print
```

## Aturan

- Stok tidak boleh negatif (`lockForUpdate()` saat dispensing & mutasi stok).
- Batch kedaluwarsa dan lokasi karantina dikecualikan dari alokasi FEFO dispensing.
- E-Resep baru hanya dapat diterbitkan untuk kunjungan berstatus `in_consultation`.
- Resep yang sudah di-dispense tidak dapat dibatalkan langsung (harus melalui alur retur).

## Ketergantungan

- Rekam Medis, Pendaftaran, Master Data (Produk), dan Kasir.
- Fondasi RBAC + audit.
