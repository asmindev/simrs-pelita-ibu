# Fase 4 — Rekam Medis

Status: selesai (asesmen SOAP, optimistic lock, finalisasi + addendum, diagnosis ICD-10, tindakan ICD-9, catatan sensitif + break-glass, laporan khusus, draft autosave, tab E-Resep, riwayat pasien lengkap dengan resep obat, serta aksi selesai konsultasi selesai).

## Referensi legacy

- `doctor/manage_prescription.php`: `case_history`, `medication`,
  `description` → asesmen + resep terstruktur.
- `doctor/manage_report.php`, `nurse/manage_report.php`: laporan
  operasi/kelahiran/kematian.
- Upload `diagnosis_report` legacy masuk Fase 6 (Penunjang).

## Backend

- [x] Migration encounter, assessment, addendum, diagnosis, procedure, report, sensitive note, draft.
- [x] Model + relasi.
- [x] Controller encounter (`EncounterRecordController::show`, `complete`), asesmen, diagnosis, tindakan, catatan sensitif, draft, laporan klinis.
- [x] `MedicalRecordService::completeEncounter` menutup kunjungan (`finished`) dan antrean terkait.
- [x] `EncounterRecordController::show` memuat `prescriptions` kunjungan dan mengirim `drugs` hanya jika status `in_consultation` dan user berizin `pharmacy.prescription.create`.
- [x] `MedicalRecordController::patientHistory` memuat `prescriptions` bila user berizin `pharmacy.prescription.view`.
- [x] FormRequest, optimistic lock `updated_at`, omisi field sensitif, audit akses `PatientAccessLog`.
- [x] Permission enum Medical Record.
- [x] Feature tests (`AssessmentTest`, `ClinicalReportAndDraftTest`, `SensitiveNoteTest`, `PrescriptionTest`).

## Frontend

- [x] `pages/medical-record/home/index.tsx` & `pages/medical-record/patient/history/index.tsx` (menampilkan SOAP, diagnosis, tindakan, resep obat, laporan, dan catatan sensitif).
- [x] `pages/medical-record/encounter/show/index.tsx` dengan Tabs: _Asesmen SOAP_, _Diagnosis ICD-10_, _Tindakan ICD-9_, _E-Resep_, _Catatan Sensitif_, dan _Laporan Khusus_.
- [x] `PatientContextBar` dengan badge status kunjungan, tombol _Riwayat Pasien_, dan tombol _Selesai Konsultasi_ (+ modal konfirmasi).
- [x] `PrescriptionEditor` menggunakan komponen bersama `PrescriptionItemsEditor` + `PrescriptionStatusBadge`.
- [x] `pages/medical-record/report/{list,create,show}/index.tsx`.
- [x] Draft autosave, guard perubahan, dan `Can` untuk field/aksi sensitif.

## Kriteria

- Draft tidak hilang saat navigasi.
- Field sensitif dan `drugs` tidak ada di payload tanpa izin/status valid.
- Konflik edit terdeteksi dan audit akses tercatat.
