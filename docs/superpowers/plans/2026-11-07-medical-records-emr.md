# Phase 4: Electronic Medical Records (EMR) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul Rekam Medis Elektronik (EMR) komprehensif: asesmen SOAP klinis, tanda vital, diagnosis ICD-10, prosedur ICD-9-CM, catatan sensitif (dengan omisi payload backend & otorisasi break-glass), laporan klinis (operasi/kelahiran/kematian), addendum catatan final, serta draft autosave dengan deteksi konflik edit (optimistic locking).

**Architecture:** Database menyimpan entitas rekam medis terstruktur yang berelasi dengan `encounters` dan `patients`: `assessments`, `diagnoses`, `procedures`, `sensitive_notes`, `clinical_reports`, `record_drafts`, dan `record_addenda`. Keamanan field sensitif ditegakkan di backend (Resource/Controller) di mana field dihilangkan dari payload JSON jika user tidak memiliki permission `medical-record.sensitive-note.view` atau aktif break-glass grant. Optimistic lock memanfaatkan `updated_at`. Audit logging ganda (`activity_log` & `patient_access_logs`) mencatat setiap pembacaan data pasien dan perubahan rekam medis. Frontend React 19 + Inertia 3 menyediakan form SOAP interaktif, editor diagnosis/prosedur, dialog addendum, dan draft autosave.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia.js 3, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Pest 4.

**Spec:** [docs/prd/rekam-medis.md](file:///home/labubu/Projects/simrs/docs/prd/rekam-medis.md), [docs/tasks/04-rekam-medis.md](file:///home/labubu/Projects/simrs/docs/tasks/04-rekam-medis.md)

---

## Global Constraints

- Frontend feature-based langsung di `resources/js/pages/medical-record/` tanpa re-export atau folder features/.
- Dilarang keras hardcode warna Tailwind statis; gunakan variabel semantik shadcn/ui (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, dll.).
- Teks UI dalam Bahasa Indonesia; identifier kode dalam Bahasa Inggris.
- URL selalu menggunakan Ziggy `route()`.
- Otorisasi backend adalah penentu utama: field sensitif di-omit oleh server, bukan hanya disembunyikan di FE.
- Seluruh verifikasi wajib lolos: `npm run types:check`, `npm run check`, `npm run build && npm run build:ssr`, `vendor/bin/pint --format agent`, dan `php artisan test --compact`.

---

### Task 1: Enums & Permissions Setup

**Files:**

- Modify: `app/Enums/Permissions/MedicalRecordPermission.php`
- Modify: `database/seeders/RoleSeeder.php`
- Create: `app/Enums/AssessmentType.php`
- Create: `app/Enums/DiagnosisType.php`
- Create: `app/Enums/ClinicalReportType.php`
- Create: `app/Enums/SensitiveCategory.php`

- [ ] **Step 1:** Di `MedicalRecordPermission.php`, tambahkan permission `ReportView = 'medical-record.report.view'` dan `ReportManage = 'medical-record.report.manage'`.
- [ ] **Step 2:** Di `RoleSeeder.php`, hubungkan permission rekam medis ke role `Doctor`, `Nurse`, `MedicalRecords`, dan `Admin`.
- [ ] **Step 3:** Buat enum:
    - `AssessmentType`: `Initial = 'initial'`, `Soap = 'soap'`, `Triage = 'triage'`, `Nursing = 'nursing'`
    - `DiagnosisType`: `Primary = 'primary'`, `Secondary = 'secondary'`
    - `ClinicalReportType`: `Surgery = 'surgery'`, `Birth = 'birth'`, `Death = 'death'`
    - `SensitiveCategory`: `Psychiatry = 'psychiatry'`, `Hiv = 'hiv'`, `SubstanceUse = 'substance_use'`

---

### Task 2: Database Migrations

**Files:**

- Create: `database/migrations/2026_11_07_000009_create_assessments_table.php`
- Create: `database/migrations/2026_11_07_000010_create_diagnoses_table.php`
- Create: `database/migrations/2026_11_07_000011_create_procedures_table.php`
- Create: `database/migrations/2026_11_07_000012_create_sensitive_notes_table.php`
- Create: `database/migrations/2026_11_07_000013_create_clinical_reports_table.php`
- Create: `database/migrations/2026_11_07_000014_create_record_drafts_table.php`
- Create: `database/migrations/2026_11_07_000015_create_record_addenda_table.php`

- [ ] **Step 1:** Buat migrasi untuk `assessments` (SOAP, vital signs, triase, status finalisasi, ForeignKeys `encounter_id`, `patient_id`, `created_by`, `finalized_by`).
- [ ] **Step 2:** Buat migrasi untuk `diagnoses` (kode & nama ICD-10, type primary/secondary, `encounter_id`, `patient_id`, `created_by`).
- [ ] **Step 3:** Buat migrasi untuk `procedures` (kode ICD-9, nama tindakan, `performed_by`, `encounter_id`, `patient_id`, `created_by`).
- [ ] **Step 4:** Buat migrasi untuk `sensitive_notes` (kategori sensitif, enkripsi/konten, `encounter_id`, `patient_id`, `created_by`).
- [ ] **Step 5:** Buat migrasi untuk `clinical_reports` (report_type surgery/birth/death, title, content, reported_at, `doctor_id`, `encounter_id`, `patient_id`).
- [ ] **Step 6:** Buat migrasi untuk `record_drafts` (autosave JSON content, unique `['encounter_id', 'user_id', 'form_type']`).
- [ ] **Step 7:** Buat migrasi untuk `record_addenda` (alasan addendum, content, `assessment_id`, `created_by`).
- [ ] **Step 8:** Jalankan `php artisan migrate` dan verifikasi tabel.

---

### Task 3: Models, Factories & Scopes

**Files:**

- Create: `app/Models/Assessment.php`
- Create: `app/Models/Diagnosis.php`
- Create: `app/Models/Procedure.php`
- Create: `app/Models/SensitiveNote.php`
- Create: `app/Models/ClinicalReport.php`
- Create: `app/Models/RecordDraft.php`
- Create: `app/Models/RecordAddendum.php`
- Create factories untuk masing-masing model
- Modify: `app/Models/Encounter.php` & `app/Models/Patient.php` (tambahkan relasi)

- [ ] **Step 1:** Definisikan model-model EMR dengan casts, relasi, fillable, dan scopes.
- [ ] **Step 2:** Buat factories untuk data testing.
- [ ] **Step 3:** Tambahkan relasi ke model `Encounter` dan `Patient`.

---

### Task 4: Policies & Unit/Sensitive Scoping

**Files:**

- Create: `app/Policies/AssessmentPolicy.php`
- Create: `app/Policies/ClinicalReportPolicy.php`
- Create: `app/Policies/SensitiveNotePolicy.php`
- Modify: `app/Providers/AppServiceProvider.php`

- [ ] **Step 1:** Buat `AssessmentPolicy`: verifikasi permission dan unit scoping kunjungan.
- [ ] **Step 2:** Buat `ClinicalReportPolicy`: verifikasi permission laporan klinis.
- [ ] **Step 3:** Buat `SensitiveNotePolicy`: hanya mengizinkan user dengan permission `SensitiveNoteView` / `SensitiveNoteUpdate` ATAU user yang memiliki grant break-glass aktif untuk pasien tersebut.
- [ ] **Step 4:** Daftarkan policies di `AppServiceProvider.php`.

---

### Task 5: FormRequests & Clinical Validation

**Files:**

- Create: `app/Http/Requests/StoreAssessmentRequest.php`
- Create: `app/Http/Requests/UpdateAssessmentRequest.php`
- Create: `app/Http/Requests/AddDiagnosisRequest.php`
- Create: `app/Http/Requests/AddProcedureRequest.php`
- Create: `app/Http/Requests/StoreSensitiveNoteRequest.php`
- Create: `app/Http/Requests/StoreClinicalReportRequest.php`
- Create: `app/Http/Requests/StoreAddendumRequest.php`

- [ ] **Step 1:** Buat FormRequests validasi dengan penegakan optimistic lock `last_updated_at`.
- [ ] **Step 2:** Validasi nilai klinis (rentang tanda vital realistis, skala nyeri 0-10, dsb.).

---

### Task 6: Controllers & Services

**Files:**

- Create: `app/Services/MedicalRecordService.php`
- Create: `app/Http/Controllers/MedicalRecord/MedicalRecordController.php`
- Create: `app/Http/Controllers/MedicalRecord/AssessmentController.php`
- Create: `app/Http/Controllers/MedicalRecord/ClinicalReportController.php`
- Create: `app/Http/Controllers/MedicalRecord/DraftController.php`
- Modify: `routes/web.php`

- [ ] **Step 1:** `MedicalRecordService`: menangani penyimpanan asesmen, omisi field sensitif bagi pengguna tanpa izin/break-glass, addendum, dan draft autosave.
- [ ] **Step 2:** `MedicalRecordController`: daftar encounter aktif untuk poli/ruang terkait dokter/perawat, riwayat kunjungan pasien.
- [ ] **Step 3:** `AssessmentController`: melihat encounter EMR (show/edit), simpan asesmen SOAP, diagnosis, prosedur, catatan sensitif, addendum, dan finalisasi catatan.
- [ ] **Step 4:** `ClinicalReportController`: index, create, store, show laporan operasi/kelahiran/kematian.
- [ ] **Step 5:** `DraftController`: autosave draft form ke `record_drafts` dan load draft.
- [ ] **Step 6:** Daftarkan routes di `routes/web.php` dan regenerate Ziggy types.

---

### Task 7: Feature Tests (Pest)

**Files:**

- Create: `tests/Feature/MedicalRecord/AssessmentTest.php`
- Create: `tests/Feature/MedicalRecord/SensitiveNoteTest.php`
- Create: `tests/Feature/MedicalRecord/ClinicalReportTest.php`
- Create: `tests/Feature/MedicalRecord/OptimisticLockTest.php`
- Create: `tests/Feature/MedicalRecord/DraftAutosaveTest.php`

- [ ] **Step 1:** Test asesmen SOAP, diagnosis, dan prosedur tersimpan dan tercatat di audit log.
- [ ] **Step 2:** Test omisi field sensitif: user tanpa permission/break-glass tidak menerima field sensitif di payload JSON; user dengan break-glass aktif dapat mengaksesnya.
- [ ] **Step 3:** Test optimistic locking: jika `last_updated_at` tidak sesuai, tolak penyimpanan untuk mencegah data overwrite.
- [ ] **Step 4:** Test catatan final: tidak dapat diubah/dihapus langsung, harus melalui addendum.
- [ ] **Step 5:** Test laporan klinis (operasi, kelahiran, kematian).
- [ ] **Step 6:** Test draft autosave.
- [ ] **Step 7:** Jalankan `php artisan test --filter=MedicalRecord` dan pastikan 100% lolos.

---

### Task 8: Frontend EMR & Clinical Views

**Files:**

- Create: `resources/js/pages/medical-record/types/medical-record.ts`
- Modify: `resources/js/pages/medical-record/home/index.tsx`
- Create: `resources/js/pages/medical-record/encounter/list/index.tsx`
- Create: `resources/js/pages/medical-record/encounter/show/index.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/patient-context-bar.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/assessment-form.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/diagnosis-editor.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/procedure-editor.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/sensitive-note-box.tsx`
- Create: `resources/js/pages/medical-record/encounter/components/addendum-dialog.tsx`
- Create: `resources/js/pages/medical-record/report/list/index.tsx`
- Create: `resources/js/pages/medical-record/report/create/index.tsx`
- Create: `resources/js/pages/medical-record/report/show/index.tsx`

- [ ] **Step 1:** Buat tipe TypeScript di `medical-record.ts`.
- [ ] **Step 2:** Buat `patient-context-bar.tsx`: bar ringkas info pasien (nama, no RM, usia, jenis kelamin, penjamin, alergi) di atas layar klinis.
- [ ] **Step 3:** Buat form SOAP dengan tabs/sections tanda vital, diagnosis ICD-10, prosedur ICD-9, dan catatan sensitif terproteksi.
- [ ] **Step 4:** Integrasikan draft autosave via endpoint `/medical-record/drafts`.
- [ ] **Step 5:** Buat tampilan laporan operasi/kelahiran/kematian.

---

### Task 9: Verification & Roadmap Documentation

**Files:**

- Modify: `docs/tasks/04-rekam-medis.md`
- Modify: `docs/tasks/README.md`

- [ ] **Step 1:** Update checklist di `docs/tasks/04-rekam-medis.md` dan `docs/tasks/README.md`.
- [ ] **Step 2:** Jalankan seluruh verifikasi:
    ```bash
    npm run types:check
    npm run check
    npm run build && npm run build:ssr
    vendor/bin/pint --format agent
    php artisan test --compact
    ```
- [ ] **Step 3:** Commit seluruh pengerjaan ke git branch `main`.
