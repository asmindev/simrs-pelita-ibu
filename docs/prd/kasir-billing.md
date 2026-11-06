# PRD — Kasir/Billing

Status: PLANNED

## Tujuan

Menghitung tagihan dari layanan yang diberikan, mencatat pembayaran, dan
mengelola void/refund serta klaim penjamin.

## Aktor

- Kasir
- Manajemen (read-only laporan)
- Auditor

## Scope

Termasuk:

- Generate invoice dari kunjungan, tindakan, obat, dan penunjang.
- Tambah/hapus item sebelum finalisasi.
- Pembayaran tunai, kartu, transfer.
- Void invoice dengan alasan.
- Refund.
- Klaim penjamin.
- Cetak invoice dan kuitansi.

Tidak termasuk:

- Akuntansi penuh dan jurnal.
- Integrasi payment gateway.

## Referensi legacy

- `accountant/manage_invoice.php`: invoice satu judul/satu nominal + status
  paid.
- `accountant/take_cash_payment.php`: pembayaran tunai.
- `accountant/payment_history.php` dan `view_payment.php` (jika ada): riwayat
  pembayaran.
- Diperluas menjadi invoice item, pajak/diskon, klaim, void/refund, dan IDR.
- Tidak diadopsi: PayPal/patient portal legacy dan field metode pembayaran yang
  tidak konsisten.

## Alur utama

1. Kasir membuka kunjungan.
2. Sistem mengumpulkan item tagihan.
3. Kasir memfinalisasi invoice.
4. Kasir mencatat pembayaran.
5. Jika salah, kasir melakukan void/refund dengan alasan.
6. Sistem mencetak invoice/kuitansi.
7. Klaim penjamin diproses terpisah.

## Entitas

- `invoices`
- `invoice_items`
- `payments`
- `refunds`
- `insurance_claims`

## Permission

```
cashier.invoice.view
cashier.invoice.create
cashier.invoice.finalize
cashier.invoice.void
cashier.payment.create
cashier.refund.create
cashier.claim.manage
cashier.report.view
```

## Aturan

- Invoice final tidak diedit; koreksi lewat void/refund.
- Void dan refund wajib alasan dan audit.
- Total invoice tidak boleh berubah setelah pembayaran.
- Kasir hanya melihat unit yang ditugaskan kecuali punya izin lintas unit.
- Cetak invoice/kuitansi memakai PDF backend.

## Kriteria penerimaan

- Perhitungan total akurat untuk kombinasi tindakan, obat, dan penunjang.
- Void/refund tercatat dan tidak menghapus histori.
- Permission dan audit diuji.
- Laporan dasar tersedia untuk manajemen.

## Ketergantungan

- Pendaftaran, Farmasi, Penunjang.
- Master Data tarif dan penjamin.
- Fondasi RBAC + audit.
