# Fase 5 — Farmasi & Kasir

## Referensi legacy

- Farmasi: `pharmacist/manage_medicine_category.php`,
  `manage_medicine.php`, dan catatan apoteker di `manage_prescription.php`.
- Kasir: `accountant/manage_invoice.php`, `take_cash_payment.php`, dan
  riwayat pembayaran.
- Legacy tidak punya stok/batch/FEFO/retur; itu fitur baru.
- Legacy invoice satu baris; SIMRS memakai invoice item dan klaim.

## Farmasi backend

- [ ] Migration prescription, dispensing, drug_batch, stock_movement, return.
- [ ] Verifikasi resep dan dispensing.
- [ ] Catatan verifikasi apoteker.
- [ ] Pengurangan stok FEFO.
- [ ] Koreksi stok dengan alasan + audit.
- [ ] Permission enum Pharmacy.
- [ ] Test stok negatif dan konkurensi.

## Farmasi frontend

- [ ] `pages/pharmacy/prescription/{index,show}.tsx`.
- [ ] `PrescriptionItemRow`, `StockPicker` di components.
- [ ] Label dan resep memakai PDF backend.

## Kasir backend

- [ ] Migration invoice, invoice_item, payment, refund, insurance_claim.
- [ ] Generate invoice dari layanan.
- [ ] Finalisasi, void, refund dengan alasan + audit.
- [ ] Riwayat pembayaran dan kuitansi.
- [ ] Permission enum Cashier.
- [ ] Test perhitungan total dan void.

## Kasir frontend

- [ ] `pages/cashier/invoice/{index,show}.tsx`.
- [ ] `InvoiceSummary`, `PaymentForm` di components.
- [ ] Invoice/kuitansi memakai PDF backend.

## Kriteria

- Stok tidak negatif.
- Invoice final tidak diedit langsung.
- Void/refund tidak menghapus histori.
- Permission dan audit diuji.
