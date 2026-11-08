# Fase 6 — Penunjang & Rawat Inap

## Referensi legacy

- Penunjang: `laboratorist/manage_prescription.php` + upload
  `diagnosis_report` (`report_type`, `document_type`, `description`, file).
- Rawat inap: `nurse/manage_bed.php`,
  `nurse/manage_bed_allotment.php`, `doctor/manage_bed_allotment.php`.
- Upload legacy dipertahankan dengan validasi tipe/ukuran.
- Bed/allotment legacy diperluas menjadi admission, transfer, daily note, dan
  discharge.
- Blood bank/donor adalah backlog opsional, belum masuk PRD inti.

## Penunjang backend

- [x] Migration diagnostic_orders, diagnostic_order_items, diagnostic_results.
- [x] Alur order, input, verifikasi, rilis.
- [x] Upload hasil file lampiran dengan validasi tipe/ukuran (PDF/JPG/PNG max 5MB).
- [x] Pelaporan nilai kritis (critical value alert banner & flag).
- [x] Permission enum Diagnostics.
- [x] Test status dan rilis hasil.

## Penunjang frontend

- [x] `pages/diagnostics/order/{list,show}/index.tsx`.
- [x] Modal dialog input hasil dan upload file (`input-result-dialog.tsx`).
- [x] Filter popover pada tabel toolbar.

## Rawat inap backend

- [x] Migration admission, bed, bed_assignment, transfer, daily_note, discharge.
- [x] Assign bed dan pencegahan bentrok (pessimistic lockForUpdate).
- [x] Transfer dan pemulangan (auto-release bed).
- [x] Permission enum Inpatient.
- [x] Test bentrok bed dan transfer.

## Rawat inap frontend

- [x] `pages/inpatient/bed/list/index.tsx` dan pendaftaran bed baru.
- [x] `pages/inpatient/admission/list/index.tsx` dan admisi pasien baru.
- [x] `pages/inpatient/admission/show/index.tsx` (detail admisi, pindah bed, pulangkan pasien, CPPT).
- [x] Filter popover pada tabel bed dan admisi.

## Kriteria

- [x] Status order berubah dan terverifikasi.
- [x] Tidak ada bentrok bed (concurrency collision guard).
- [x] Audit transfer dan pemulangan tercatat.
