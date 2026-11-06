# Fase 4 — Rekam Medis

## Backend

- [ ] Migration encounter, assessment, diagnosis, procedure, sensitive note, draft.
- [ ] Model + relasi.
- [ ] Controller encounter dan asesmen.
- [ ] FormRequest dengan validasi klinis dasar.
- [ ] Policy scoping poli/ruang.
- [ ] Optimistic lock `updated_at`.
- [ ] Omisi field sensitif di Resource/Controller.
- [ ] Addendum untuk catatan final.
- [ ] Audit akses pasien.
- [ ] Permission enum Medical Record.
- [ ] Test field sensitif dan konkurensi.

## Frontend

- [ ] `pages/medical-record/encounter/{index,show,edit}.tsx`.
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
