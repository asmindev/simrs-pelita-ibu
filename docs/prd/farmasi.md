# PRD — Farmasi

Status: PLANNED

## Tujuan

Mengelola resep, dispensing, dan stok obat dengan kontrol batch dan kedaluwarsa.

## Aktor

- Apoteker
- Asisten apoteker (jika ada)

## Scope

Termasuk:

- Menerima resep dari rekam medis.
- Verifikasi resep dan interaksi dasar.
- Dispensing dan pencatatan batch.
- Pengurangan stok otomatis.
- Retur obat.
- Stok opname.
- Label obat dan cetak resep.

Tidak termasuk:

- Pengadaan/pembelian.
- Klaim penjamin.

## Alur utama

1. Resep masuk dari rekam medis.
2. Apoteker memverifikasi.
3. Sistem menampilkan stok tersedia per batch.
4. Apoteker melakukan dispensing.
5. Stok berkurang dan tercatat.
6. Label/resep dicetak.
7. Retur atau koreksi dicatat dengan alasan.

## Entitas

- `prescriptions`
- `prescription_items`
- `dispensings`
- `drug_batches` (batch, kedaluwarsa, jumlah)
- `stock_movements`
- `stock_returns`

## Permission

```
pharmacy.prescription.view
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

- Stok tidak boleh negatif.
- Batch kedaluwarsa tidak boleh dipakai tanpa izin khusus.
- Koreksi stok wajib alasan dan audit.
- Resep yang sudah di-dispense tidak bisa dihapus.
- Cetak label memakai PDF backend.

## Kriteria penerimaan

- Pengurangan stok konsisten saat dua apoteker memproses bersamaan.
- Batch FEFO (first expired first out) diprioritaskan.
- Audit mencatat adjust, retur, dan dispensing.
- Permission matrix diuji.

## Ketergantungan

- Rekam Medis dan Master Data.
- Fondasi RBAC + audit.
