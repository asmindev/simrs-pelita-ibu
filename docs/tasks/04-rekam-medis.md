# Fase 4 — Rekam Medis

## Referensi legacy

- `doctor/manage_prescription.php`: `case_history`, `medication`,
  `description` → asesmen + resep terstruktur.
- `doctor/manage_report.php`, `nurse/manage_report.php`: laporan
  operasi/kelahiran/kematian.
- Upload `diagnosis_report` legacy masuk Fase 6 (Penunjang).

## Backend

- [x] Migration encounter, assessment, diagnosis, procedure, report, sensitive
      note, draft.
- [x] Model + relasi.
- [x] Controller encounter, asesmen, dan laporan tindakan.
- [x] FormRequest dengan validasi klinis dasar.
- [x] Policy scoping poli/ruang.
- [x] Optimistic lock `updated_at`.
- [x] Omisi field sensitif di Resource/Controller.
- [x] Addendum untuk catatan final.
- [x] Audit akses pasien.
- [x] Permission enum Medical Record (termasuk `report.view/manage`).
- [x] Test field sensitif, laporan, dan konkurensi.

## Frontend

- [x] `pages/medical-record/encounter/{list,show,edit}/index.tsx`.
- [x] `pages/medical-record/report/{list,create,edit}/index.tsx`.
- [x] Sub-layout clinical dengan patient context bar.
- [x] `AssessmentForm`, `DiagnosisEditor`, `SensitiveNote` di components.
- [x] Draft autosave dan guard perubahan.
- [x] `Can` untuk field dan aksi sensitif.
- [x] Tampilan konflik edit.

## Kriteria

- Draft tidak hilang saat navigasi.
- Field sensitif tidak ada di payload tanpa izin.
- Konflik edit terdeteksi.
- Audit akses tercatat.
