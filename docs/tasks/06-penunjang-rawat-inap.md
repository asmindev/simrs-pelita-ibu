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

- [ ] Migration service_order, sample, lab_result, radiology_result, critical_value.
- [ ] Alur order, input, verifikasi, rilis.
- [ ] Upload hasil legacy dengan validasi tipe/ukuran.
- [ ] Pelaporan nilai kritis.
- [ ] Permission enum Diagnostics.
- [ ] Test status dan rilis hasil.

## Penunjang frontend

- [ ] `pages/diagnostics/order/{index,show}.tsx`.
- [ ] `pages/diagnostics/result/{index,show}.tsx`.
- [ ] `usePoll` untuk status order.
- [ ] Cetak hasil memakai PDF backend.

## Rawat inap backend

- [ ] Migration admission, bed, bed_assignment, transfer, daily_note, discharge.
- [ ] Assign bed dan pencegahan bentrok.
- [ ] Transfer dan pemulangan.
- [ ] Permission enum Inpatient.
- [ ] Test bentrok bed dan transfer.

## Rawat inap frontend

- [ ] `pages/inpatient/admission/{index,create}.tsx`.
- [ ] `pages/inpatient/bed/index.tsx`.
- [ ] `pages/inpatient/patient/{index,show}.tsx`.
- [ ] `usePoll` untuk ketersediaan bed.

## Kriteria

- Status order berubah tanpa reload manual.
- Tidak ada bentrok bed.
- Audit transfer dan pemulangan tercatat.
