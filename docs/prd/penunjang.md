# PRD — Penunjang (Laboratorium & Radiologi)

Status: PLANNED

## Tujuan

Mengelola order pemeriksaan penunjang, pengambilan sampel, input hasil,
verifikasi, rilis hasil, dan pelaporan nilai kritis.

## Aktor

- Dokter (order)
- Analis laboratorium
- Radiografer
- Perawat (lihat hasil)

## Scope

Termasuk:

- Order lab/radiologi dari rekam medis.
- Pengambilan sampel dan status pemeriksaan.
- Input hasil laboratorium dan radiologi.
- Verifikasi dan rilis hasil.
- Pelaporan nilai kritis.
- Cetak hasil.
- Polling status untuk halaman kritis.

Tidak termasuk:

- Integrasi alat laboratorium otomatis.
- PACS/radiologi imaging viewer.

## Referensi legacy

- `laboratorist/manage_prescription.php` + upload `diagnosis_report`
  (`report_type`, `document_type`, `description`, file) → service order dan
  hasil.
- File tetap didukung dengan validasi tipe/ukuran dan akses berbasis
  permission.
- Legacy tidak punya katalog test, reference range, verifikasi, atau rilis
  hasil; itu fitur baru di SIMRS.

## Alur utama

1. Dokter membuat order.
2. Petugas menerima order dan mengambil sampel.
3. Analis/radiografer mengisi hasil.
4. Hasil diverifikasi.
5. Nilai kritis dilaporkan dan dicatat.
6. Hasil dirilis ke rekam medis.
7. Hasil dicetak jika diperlukan.

## Entitas

- `service_orders`
- `service_order_items`
- `samples`
- `lab_results`
- `radiology_results`
- `critical_value_reports`

## Permission

```
diagnostics.order.view
diagnostics.order.create
diagnostics.result.view
diagnostics.result.input
diagnostics.result.verify
diagnostics.result.release
diagnostics.critical-value.report
diagnostics.result.print
```

## Aturan

- Hasil yang sudah dirilis tidak diubah tanpa addendum.
- Nilai kritis wajib laporan dan tercatat.
- Hanya unit penunjang terkait yang boleh mengubah hasil (Policy).
- Status order sinkron dengan rekam medis.
- Cetak hasil memakai PDF backend.

## Kriteria penerimaan

- Status order terlihat berubah tanpa reload manual (polling).
- Hasil tidak bisa dirilis sebelum diverifikasi.
- Audit mencatat input, verifikasi, rilis, dan nilai kritis.
- Permission matrix diuji.

## Ketergantungan

- Rekam Medis.
- Fondasi RBAC + audit.
