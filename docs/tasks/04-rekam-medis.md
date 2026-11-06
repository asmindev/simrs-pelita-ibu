# Fase 4 — Rekam Medis

## Referensi legacy

- `doctor/manage_prescription.php`: `case_history`, `medication`,
  `description` → asesmen + resep terstruktur.
- `doctor/manage_report.php`, `nurse/manage_report.php`: laporan
  operasi/kelahiran/kematian.
- Upload `diagnosis_report` legacy masuk Fase 6 (Penunjang).

## Backend

- [ ] Migration encounter, assessment, diagnosis, procedure, report, sensitive
      note, draft.
- [ ] Model + relasi.
- [ ] Controller encounter, asesmen, dan laporan tindakan.
- [ ] FormRequest dengan validasi klinis dasar.
- [ ] Policy scoping poli/ruang.
- [ ] Optimistic lock `updated_at`.
- [ ] Omisi field sensitif di Resource/Controller.
- [ ] Addendum untuk catatan final.
- [ ] Audit akses pasien.
- [ ] Permission enum Medical Record (termasuk `report.view/manage`).
- [ ] Test field sensitif, laporan, dan konkurensi.

## Frontend

- [ ] `pages/medical-record/encounter/{index,show,edit}.tsx`.
- [ ] `pages/medical-record/report/{index,create,edit}.tsx`.
- [ ] Sub-layout clinical dengan patient context bar.
- [ ] `AssessmentForm`, `DiagnosisEditor`, `SensitiveNote` di components.
- [ ] Draft autosave dan guard perubahan.
- [ ] `Can` untuk field dan aksi sensitif.
- [ ] Tampilan konflik edit.

## Kriteria

- Draft tidak hilang saat navigasi.
- Field sensitif tidak ada di payload tanpa izin.
- Konflik edit terdeteksi.
- Audit akses tercatat.
