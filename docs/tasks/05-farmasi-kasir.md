# Fase 5 — Farmasi & Kasir

## Referensi legacy

- Farmasi: `pharmacist/manage_medicine_category.php`,
  `manage_medicine.php`, dan catatan apoteker di `manage_prescription.php`.
- Kasir: `accountant/manage_invoice.php`, `take_cash_payment.php`, dan
  riwayat pembayaran.
- Legacy tidak punya stok/batch/FEFO/retur; itu fitur baru.
- Legacy invoice satu baris; SIMRS memakai invoice item dan klaim, dengan proses pembayaran langsung yang sederhana dan cepat.

## Farmasi backend

- [x] Migration prescription, dispensing, drug_batch, stock_movement, return.
- [x] Verifikasi resep dan dispensing.
- [x] Catatan verifikasi apoteker.
- [x] Pengurangan stok FEFO.
- [x] Koreksi stok dengan alasan + audit.
- [x] Permission enum Pharmacy.
- [x] Test stok negatif dan konkurensi.

## Farmasi frontend

- [x] `pages/pharmacy/prescription/{list,show}/index.tsx`.
- [x] `pages/pharmacy/stock/index.tsx` (Batch list, FEFO, NewBatchDialog, StockAdjustDialog).
- [x] Integrasi FilterPopover dan TableToolbar standar.

## Kasir backend

- [x] Migration invoice, invoice_item, payment, refund, insurance_claim.
- [x] Generate invoice otomatis dari layanan (administrasi, konsultasi, dan obat farmasi).
- [x] Penerimaan pembayaran multi-metode (tunai, transfer, qris, kartu), hitung kembalian, auto-finalize.
- [x] Void dan refund dengan alasan + audit trail.
- [x] Riwayat pembayaran dan kuitansi.
- [x] Permission enum Cashier.
- [x] Test perhitungan total, pembayaran lunas, void, dan refund.

## Kasir frontend

- [x] `pages/cashier/invoice/{list,show}/index.tsx`.
- [x] `InvoiceFilters` (TableToolbar + FilterPopover).
- [x] `PaymentDialog` (modal terima pembayaran praktis dengan tombol cepat "Bayar Pas" dan kalkulator kembalian).
- [x] Struk rincian tagihan & kuitansi siap cetak.

## Kriteria

- Stok tidak negatif (teruji via pessimistic locking `lockForUpdate`).
- Invoice final tidak diedit langsung (pembatalan melalui alur void dengan alasan).
- Void/refund tidak menghapus histori (tercatat di tabel `refunds` dan activitylog).
- Permission dan audit diuji (17 feature tests lulus).
