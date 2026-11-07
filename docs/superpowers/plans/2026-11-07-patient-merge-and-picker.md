# Patient Merge & Reusable PatientPicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun alur penggabungan berkas rekam medis duplikat (`Patient Merge`) lengkap dengan jejak audit rujukan nomor RM, serta menyediakan komponen reusable `PatientPicker` untuk pencarian cepat pasien di seluruh modul pelayanan.

**Architecture:** Database menyimpan pointer `merged_to_patient_id` dan `merged_at` pada tabel `patients`. Controller `PatientController` menangani `POST /master-data/patients/{patient}/merge` dalam database transaction dengan otorisasi `master-data.patient.merge` dan pencatatan audit log ganda (`activity_log` dan `patient_access_logs`). Endpoint pencarian cepat `GET /master-data/patients/search` melayani komponen reusable `PatientPicker` berbasis React 19 + shadcn semantic tokens dengan debounce dan status badge.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia.js 3, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Pest 4.

**Spec:** [docs/prd/master-data.md](file:///home/labubu/Projects/simrs/docs/prd/master-data.md), [docs/tasks/02-master-data.md](file:///home/labubu/Projects/simrs/docs/tasks/02-master-data.md)

## Global Constraints

- Frontend feature-based langsung di `resources/js/pages/master-data/patient/` tanpa re-export atau folder features/.
- Dilarang hardcode warna; selalu gunakan variabel semantik shadcn / `app.css` (`bg-primary`, `bg-secondary`, `border-border`, dll.).
- Teks UI dalam Bahasa Indonesia; identifier kode dalam Bahasa Inggris.
- URL selalu menggunakan Ziggy `route()`.
- Otorisasi merge menggunakan permission `master-data.patient.merge`.
- Seluruh verifikasi wajib lolos: `npm run types:check`, `npm run check`, `npm run build`, `vendor/bin/pint --format agent`, dan `php artisan test --compact`.

## Review Focus

1. **Self-merge rejection:** Pasien tidak boleh di-merge ke dirinya sendiri (`target_patient_id != patient.id`).
2. **Double-merge prevention:** Pasien yang sudah pernah di-merge (`is_active = false` / `merged_to_patient_id != null`) tidak boleh dijadikan target atau di-merge ulang tanpa validasi.
3. **Database consistency in transaction:** Penggabungan harus atomik: jika pencatatan audit log atau update gagal, seluruh operasi di-rollback.
4. **Audit trail kelengkapan:** Log mencatat nomor RM sumber, nomor RM target, nama operator, dan alasan tertulis penggabungan.
5. **Debounce & UX search di PatientPicker:** Pencarian pasien tidak boleh spamming request pada setiap ketikan (gunakan debounce ~300ms) dan menangani empty/loading state secara elegan.

---

### Task 1: Database Migration (`patients` table merge fields)

**Files:**

- Create: `database/migrations/2026_11_07_000005_add_merge_fields_to_patients_table.php`

- [ ] **Step 1:** Buat file migration `2026_11_07_000005_add_merge_fields_to_patients_table.php` menambahkan:
    - `merged_to_patient_id` (foreignId nullable constrained to `patients.id`, nullOnDelete)
    - `merged_at` (timestamp nullable)
    - Index pada `merged_to_patient_id`
- [ ] **Step 2:** Jalankan `php artisan migrate` dan verifikasi skema.

---

### Task 2: Model & Policy Updates (`Patient` & `PatientPolicy`)

**Files:**

- Modify: `app/Models/Patient.php`
- Modify: `app/Policies/PatientPolicy.php`

- [ ] **Step 1:** Di `app/Models/Patient.php`, tambahkan fillable `merged_to_patient_id`, `merged_at`, cast `'merged_at' => 'datetime'`, relasi `mergedTo(): BelongsTo<Patient, $this>`, dan relasi `mergedFrom(): HasMany<Patient, $this>`.
- [ ] **Step 2:** Di `app/Policies/PatientPolicy.php`, tambahkan method `merge(User $user, Patient $patient): bool` yang memeriksa permission `MasterDataPermission::PatientMerge->value`.

---

### Task 3: FormRequest & Search Endpoint

**Files:**

- Create: `app/Http/Requests/MergePatientRequest.php`

- [ ] **Step 1:** Buat `MergePatientRequest`:
    - `authorize()`: cek `$user->can('merge', $patient)`
    - `rules()`:
        - `target_patient_id`: `['required', 'integer', 'exists:patients,id', 'different:id']`
        - `reason`: `['required', 'string', 'max:500']`
    - Validasi kustom: pastikan target patient aktif dan bukan pasien yang sudah dimerge.

---

### Task 4: Controller Methods & Web Routes

**Files:**

- Modify: `app/Http/Controllers/PatientController.php`
- Modify: `routes/web.php`

- [ ] **Step 1:** Di `PatientController.php`, tambahkan method:
    - `search(Request $request): JsonResponse`: mencari pasien berdasarkan NIK, Nomor RM, atau Nama dengan limit 10, mengembalikan format ringkas untuk `PatientPicker`.
    - `merge(MergePatientRequest $request, Patient $patient): RedirectResponse`: menjalankan merge dalam transaksi database, menonaktifkan pasien sumber, set `merged_to_patient_id`, catat di `activity_log` dan `patient_access_logs`, lalu redirect dengan flash success.
- [ ] **Step 2:** Daftarkan route di `routes/web.php` dalam grup `master-data.patients.`:
    - `GET search` (`master-data.patients.search`) dengan middleware `permission:master-data.patient.view`.
    - `POST {patient}/merge` (`master-data.patients.merge`) dengan middleware `permission:master-data.patient.merge`.
- [ ] **Step 3:** Jalankan `php artisan ziggy:generate resources/js/ziggy.js` dan update Ziggy types.

---

### Task 5: Feature Tests (Pest)

**Files:**

- Create: `tests/Feature/MasterData/PatientMergeTest.php`

- [ ] **Step 1:** Tulis test kasus di `PatientMergeTest.php`:
    - Test otorisasi: user tanpa permission `master-data.patient.merge` ditolak (403)
    - Test validasi: tidak bisa merge ke diri sendiri
    - Test validasi: tidak bisa merge ke pasien yang sudah nonaktif/merged
    - Test sukses: status pasien sumber menjadi tidak aktif dan memiliki `merged_to_patient_id`
    - Test audit log: tercatat di `activity_log` dengan detail nomor RM dan alasan
    - Test pencarian pasien di endpoint `/master-data/patients/search`
- [ ] **Step 2:** Jalankan `php artisan test --filter=PatientMerge` dan pastikan seluruh test lolos 100%.

---

### Task 6: Reusable Frontend Component `PatientPicker`

**Files:**

- Create: `resources/js/pages/master-data/patient/components/patient-picker.tsx`

- [ ] **Step 1:** Buat `PatientPicker` dengan fitur:
    - Input teks pencarian dengan ikon `Search` dan debounce 300ms
    - Fetch ke `route('master-data.patients.search', { q: query })`
    - Dropdown hasil: nomor RM (tabular-nums), NIK, Nama, Tanggal Lahir, Jenis Kelamin, Badge status
    - Selected state: kartu ringkas pasien terpilih dengan tombol ganti/hapus
    - Sepenuhnya menggunakan variabel semantik shadcn/app.css.

---

### Task 7: Frontend `PatientMergeDialog` & Integrasi

**Files:**

- Create: `resources/js/pages/master-data/patient/components/patient-merge-dialog.tsx`
- Modify: `resources/js/pages/master-data/patient/components/patient-form.tsx`
- Modify: `resources/js/pages/master-data/patient/edit/index.tsx`

- [ ] **Step 1:** Buat `patient-merge-dialog.tsx` berbasis `Dialog`:
    - Menerima `sourcePatient` dan target kandidat
    - Menampilkan ringkasan perbandingan data kedua berkas RM
    - Input alasan penggabungan
    - Tombol aksi dibungkus `<Can permission="master-data.patient.merge">`
    - Submit form via `useForm` ke route `master-data.patients.merge`.
- [ ] **Step 2:** Di `patient-form.tsx`, tambahkan tombol "Gabungkan Berkas" pada setiap baris kandidat duplikat.
- [ ] **Step 3:** Di `edit/index.tsx`, sediakan tombol aksi merge jika pasien terindikasi ganda.

---

### Task 8: Verification & Roadmap Documentation

**Files:**

- Modify: `docs/tasks/02-master-data.md`

- [ ] **Step 1:** Update checklist `docs/tasks/02-master-data.md` untuk item merge pasien dan patient picker.
- [ ] **Step 2:** Jalankan seluruh verifikasi:
    ```bash
    npm run types:check
    npm run check
    npm run build && npm run build:ssr
    vendor/bin/pint --format agent
    php artisan test --compact
    ```
- [ ] **Step 3:** Commit hasil pengerjaan ke git branch `main`.
