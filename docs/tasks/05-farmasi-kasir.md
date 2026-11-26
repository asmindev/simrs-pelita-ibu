# Fase 5 — Farmasi, Inventaris & Kasir

Status: selesai (E-Resep end-to-end EMR/Farmasi khusus pasien `in_consultation`, telaah & dispensing FEFO, retur, modul Inventaris terpisah dengan `StockMoveDialog` redesign & `NewStockDialog` dengan `Combobox` + `DatePicker` shadcn, serta modul Kasir selesai).

## Farmasi & Inventaris backend

- [x] Migration `prescriptions`, `prescription_items`, `dispensings`, `product_batches`, `stock_locations`, `stock_quants`, `stock_movements`, `stock_valuation_layers`, `stock_returns`.
- [x] `PrescriptionService`: buat e-resep (khusus kunjungan `in_consultation`), daftar obat aktif beserta stok FEFO (`getPrescribableDrugs`), verifikasi, dispensing FEFO, pembatalan.
- [x] `PrescriptionController::index`: kirim `drugs` & `activeEncounters` (hanya `in_consultation` hari ini atau rawat inap aktif) bila berizin `pharmacy.prescription.create`.
- [x] `PharmacyStockController` & `PharmacyStockService`: stok per `(Gudang, Produk)`, detail item stok, batch masuk, transfer/pergerakan stok, opname, gudang, dan valuasi FIFO.
- [x] Sinkronisasi otomatis obat dispensed ke draft invoice Kasir.
- [x] Permission enum Pharmacy & feature tests (`PrescriptionTest`, `StockTest`).

## Farmasi & Inventaris frontend

- [x] `pages/pharmacy/prescription/{list,show}/index.tsx` + `CreatePrescriptionDialog` (memilih pasien `Sedang Dilayani` & multi-baris obat lewat `PrescriptionItemsEditor`).
- [x] `pages/inventory/stock/{index,show/index}.tsx`: tabel 1 baris = 1 `(Gudang, Produk)`, halaman detail batch & mutasi, `NewStockDialog` (`Combobox` + `DatePicker`/`Calendar` shadcn), dan redesign `StockMoveDialog` (segmented selector, rute 3 kolom + swap, stok real-time per lokasi, preview saldo akhir).
- [x] `pages/inventory/warehouse/list/index.tsx`, `pages/inventory/move/index.tsx`, dan `pages/inventory/valuation/index.tsx`.
- [x] Komponen shared: `Combobox`, `DatePicker`, `Calendar`, `PrescriptionItemsEditor`, `PrescriptionStatusBadge`.

## Kasir backend & frontend

- [x] Migration `invoices`, `invoice_items`, `payments`, `refunds`, `insurance_claims`.
- [x] Generate invoice otomatis dari layanan (administrasi, konsultasi, penunjang, dan obat farmasi).
- [x] Penerimaan pembayaran multi-metode, hitung kembalian, auto-finalize, void, dan refund dengan audit trail.
- [x] `pages/cashier/invoice/{list,show}/index.tsx` (`InvoiceFilters`, `PaymentDialog`, struk kuitansi siap cetak).

## Kriteria

- Stok tidak negatif dan batch FEFO diprioritaskan.
- Pembuatan E-Resep ditolak jika kunjungan bukan `in_consultation`.
- Permission, omisi data tanpa izin, dan audit teruji dengan Pest.
