# Phase 3: Registration, Encounters & Queues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul Pendaftaran Pasien, Kunjungan Rawat Jalan/IGD (`encounters`), Penerbitan Antrean Unit Harian (`queues`), serta Papan Antrean (`QueueBoard`) dengan polling otomatis dan scoping unit.

**Architecture:** Database menyimpan entitas `encounters`, `queues`, dan `insurance_coverages`. Penomoran antrean bersifat atomik dan unik per unit per hari menggunakan transaksi database dengan lock (`FOR UPDATE`). Otorisasi menerapkan spatie permissions `registration.*` serta scoping unit pengguna via `EncounterPolicy` dan `QueuePolicy`. Seluruh pembatalan dan perubahan alur antrean mencatat audit log ganda (`activity_log` dan `patient_access_logs`). Frontend menggunakan React 19 + Inertia 3 dengan polling `usePoll` untuk papan antrean real-time serta komponen `PatientPicker` dari Master Data.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia.js 3, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Pest 4.

**Spec:** [docs/prd/pendaftaran.md](file:///home/labubu/Projects/simrs/docs/prd/pendaftaran.md), [docs/tasks/03-pendaftaran.md](file:///home/labubu/Projects/simrs/docs/tasks/03-pendaftaran.md)

---

## Global Constraints

- Frontend feature-based langsung di `resources/js/pages/registration/` tanpa re-export atau folder features/.
- Dilarang keras hardcode warna Tailwind statis (seperti `bg-blue-500`, `text-green-600`); gunakan variabel semantik shadcn/ui (`bg-primary`, `bg-card`, `border-border`, `text-muted-foreground`, dll.).
- Teks UI dalam Bahasa Indonesia; identifier kode dalam Bahasa Inggris.
- URL selalu menggunakan Ziggy `route()`.
- Otorisasi backend adalah penentu utama; guard FE `<Can>` hanya untuk UX.
- Seluruh verifikasi wajib lolos: `npm run types:check`, `npm run check`, `npm run build && npm run build:ssr`, `vendor/bin/pint --format agent`, dan `php artisan test --compact`.

---

### Task 1: Enums & Database Migrations

**Files:**

- Create: `app/Enums/EncounterType.php`
- Create: `app/Enums/EncounterStatus.php`
- Create: `app/Enums/QueueStatus.php`
- Create: `database/migrations/2026_11_07_000006_create_encounters_table.php`
- Create: `database/migrations/2026_11_07_000007_create_queues_table.php`
- Create: `database/migrations/2026_11_07_000008_create_insurance_coverages_table.php`

- [ ] **Step 1:** Buat enum:
    - `EncounterType`: `Outpatient = 'outpatient'`, `Emergency = 'emergency'`
    - `EncounterStatus`: `Arrived = 'arrived'`, `InConsultation = 'in_consultation'`, `Finished = 'finished'`, `Cancelled = 'cancelled'`
    - `QueueStatus`: `Waiting = 'waiting'`, `Calling = 'calling'`, `Serving = 'serving'`, `Completed = 'completed'`, `Skipped = 'skipped'`, `Cancelled = 'cancelled'`
- [ ] **Step 2:** Buat migration `encounters` dengan kolom:
    - `id`, `encounter_number` (string unique), `patient_id` (foreignId constrained), `unit_id` (foreignId constrained), `doctor_id` (foreignId nullable constrained), `type` (string/enum), `status` (string/enum default 'arrived'), `guarantor_id` (foreignId constrained), `arrived_at` (timestamp), `consultation_started_at` (timestamp nullable), `consultation_ended_at` (timestamp nullable), `cancellation_reason` (string nullable), `cancelled_at` (timestamp nullable), `cancelled_by` (foreignId nullable constrained to users), `notes` (text nullable), `created_by` (foreignId nullable constrained to users), `timestamps`.
- [ ] **Step 3:** Buat migration `queues` dengan kolom:
    - `id`, `encounter_id` (foreignId constrained cascadeOnDelete), `unit_id` (foreignId constrained), `queue_date` (date), `queue_number` (unsignedInteger), `queue_code` (string), `status` (string/enum default 'waiting'), `called_at` (timestamp nullable), `called_by` (foreignId nullable constrained to users), `served_at` (timestamp nullable), `completed_at` (timestamp nullable), `timestamps`. Unique constraint: `['unit_id', 'queue_date', 'queue_number']`.
- [ ] **Step 4:** Buat migration `insurance_coverages` dengan kolom:
    - `id`, `encounter_id` (foreignId constrained cascadeOnDelete), `guarantor_id` (foreignId constrained), `card_number` (string nullable), `claim_number` (string nullable), `notes` (text nullable), `timestamps`.
- [ ] **Step 5:** Jalankan `php artisan migrate` dan verifikasi skema database.

---

### Task 2: Models, Factories & Scopes

**Files:**

- Create: `app/Models/Encounter.php`
- Create: `app/Models/Queue.php`
- Create: `app/Models/InsuranceCoverage.php`
- Create: `database/factories/EncounterFactory.php`
- Create: `database/factories/QueueFactory.php`
- Create: `database/factories/InsuranceCoverageFactory.php`
- Modify: `app/Models/Patient.php` (relasi `encounters`)
- Modify: `app/Models/Unit.php` (relasi `encounters`, `queues`)
- Modify: `app/Models/Doctor.php` (relasi `encounters`)

- [ ] **Step 1:** Definisikan model `Encounter` dengan relasi `patient`, `unit`, `doctor`, `guarantor`, `queue`, `insuranceCoverage`, `cancelledBy`, `createdBy`, casts enum, dan scopes (`active`, `today`, `forUnit`).
- [ ] **Step 2:** Definisikan model `Queue` dengan relasi `encounter`, `unit`, `calledBy`, casts enum, dan scopes (`waiting`, `active`, `today`, `forUnit`).
- [ ] **Step 3:** Definisikan model `InsuranceCoverage` dengan relasi `encounter`, `guarantor`.
- [ ] **Step 4:** Buat factories untuk `Encounter`, `Queue`, dan `InsuranceCoverage`.

---

### Task 3: Policies & Unit Scoping

**Files:**

- Create: `app/Policies/EncounterPolicy.php`
- Create: `app/Policies/QueuePolicy.php`
- Modify: `app/Providers/AppServiceProvider.php` (jika perlu mendaftarkan policy)

- [ ] **Step 1:** Buat `EncounterPolicy`:
    - `viewAny(User $user)`: cek permission `registration.visit.view`
    - `view(User $user, Encounter $encounter)`: jika user memiliki unitIds dan bukan admin, verifikasi `$user->hasUnitAccess($encounter->unit_id)`
    - `create(User $user)`: cek permission `registration.visit.create`
    - `update(User $user, Encounter $encounter)`: cek permission `registration.visit.update`
    - `cancel(User $user, Encounter $encounter)`: cek permission `registration.visit.cancel` dan status kunjungan belum selesai (`$encounter->status !== EncounterStatus::Finished`)
- [ ] **Step 2:** Buat `QueuePolicy`:
    - `viewAny(User $user)`: cek permission `registration.queue.view`
    - `call(User $user, Queue $queue)`: cek permission `registration.queue.call` dan verifikasi akses unit user
    - `serve(User $user, Queue $queue)`: cek permission `registration.queue.call`
    - `complete(User $user, Queue $queue)`: cek permission `registration.queue.call`
    - `skip(User $user, Queue $queue)`: cek permission `registration.queue.call`

---

### Task 4: FormRequests & Validation

**Files:**

- Create: `app/Http/Requests/StoreEncounterRequest.php`
- Create: `app/Http/Requests/CancelEncounterRequest.php`

- [ ] **Step 1:** Buat `StoreEncounterRequest`:
    - Validasi: `patient_id` (wajib, exists di patients, aktif, dan bukan yang dimerge), `unit_id` (wajib, exists di units aktif), `doctor_id` (nullable, exists di doctors aktif), `type` (wajib enum `EncounterType`), `guarantor_id` (wajib, exists di guarantors aktif), `card_number` (nullable/required jika tipe penjamin bpjs/asuransi), `claim_number` (nullable string), `notes` (nullable string), `override_duplicate` (boolean).
    - Validasi duplikat kustom di `after()`: periksa apakah ada kunjungan aktif untuk pasien yang sama di unit yang sama hari ini, kecuali jika `override_duplicate == true`.
- [ ] **Step 2:** Buat `CancelEncounterRequest`:
    - Validasi: `cancellation_reason` (wajib, string, min:5, max:500).

---

### Task 5: Services & Controller Methods

**Files:**

- Create: `app/Services/RegistrationService.php`
- Create: `app/Http/Controllers/Registration/RegistrationController.php`
- Create: `app/Http/Controllers/Registration/EncounterController.php`
- Create: `app/Http/Controllers/Registration/QueueController.php`
- Modify: `routes/web.php`

- [ ] **Step 1:** Buat `RegistrationService`:
    - `generateEncounterNumber(): string`: generate nomor format `ENC-YYYYMMDD-XXXXX`.
    - `generateQueueNumber(Unit $unit, Carbon $date): array{number: int, code: string}`: mengunci row antrean hari ini (`FOR UPDATE`) untuk memastikan tidak terjadi duplikasi race condition.
    - `createEncounter(array $data, User $actor): Encounter`: mengeksekusi pembuatan encounter, penerbitan queue, dan coverage asuransi dalam transaksi database, serta mencatat audit log dan access log.
- [ ] **Step 2:** Buat `RegistrationController`:
    - `index`: Dashboard pendaftaran, ringkasan jumlah kunjungan per unit dan antrean hari ini.
- [ ] **Step 3:** Buat `EncounterController`:
    - `index`: Daftar kunjungan dengan filter tanggal, unit, status, search, dan pagination Inertia.
    - `create`: Menampilkan form pendaftaran dengan master unit, dokter + jadwal hari ini, penjamin, dan `PatientPicker`.
    - `store`: Memproses pendaftaran kunjungan melalui `RegistrationService`.
    - `show`: Menampilkan detail kunjungan, riwayat antrean, dan penjamin.
    - `cancel`: Membatalkan kunjungan dengan alasan dan mencatat audit log.
- [ ] **Step 4:** Buat `QueueController`:
    - `board(Request $request)`: Menampilkan papan antrean per unit.
    - `call(Queue $queue)`: Memanggil antrean (status `calling`).
    - `serve(Queue $queue)`: Memulai pelayanan (status `serving`, update encounter `in_consultation`).
    - `complete(Queue $queue)`: Menyelesaikan pelayanan (status `completed`, update encounter `finished`).
    - `skip(Queue $queue)`: Melewati antrean (status `skipped`).
    - `data(Request $request)`: Endpoint JSON status antrean untuk polling live board.
- [ ] **Step 5:** Daftarkan seluruh rute di `routes/web.php` dan generate Ziggy types.

---

### Task 6: Feature Tests (Pest)

**Files:**

- Create: `tests/Feature/Registration/EncounterRegistrationTest.php`
- Create: `tests/Feature/Registration/QueueManagementTest.php`
- Create: `tests/Feature/Registration/UnitScopingTest.php`

- [ ] **Step 1:** `EncounterRegistrationTest.php`:
    - Test otorisasi: guest dan user tanpa permission ditolak.
    - Test pendaftaran berhasil menerbitkan nomor kunjungan dan nomor antrean.
    - Test pencegahan kunjungan ganda (ditolak tanpa `override_duplicate`).
    - Test pembatalan kunjungan dengan alasan tercatat di audit log.
    - Test pasien nonaktif atau yang sudah dimerge ditolak untuk pendaftaran baru.
- [ ] **Step 2:** `QueueManagementTest.php`:
    - Test urutan pemanggilan antrean (waiting -> calling -> serving -> completed).
    - Test konkurensi penomoran antrean tidak duplikat.
    - Test lewati antrean (skip).
- [ ] **Step 3:** `UnitScopingTest.php`:
    - Test user hanya dapat melihat/memanggil antrean unit yang ditugaskan kepadanya.
    - Test admin dapat melihat dan memanggil antrean seluruh unit.
- [ ] **Step 4:** Jalankan `php artisan test --filter=Registration` dan pastikan 100% lulus.

---

### Task 7: Frontend Registration & Encounter Views

**Files:**

- Create: `resources/js/pages/registration/types/registration.ts`
- Modify: `resources/js/pages/registration/home/index.tsx`
- Create: `resources/js/pages/registration/visit/list/index.tsx`
- Create: `resources/js/pages/registration/visit/create/index.tsx`
- Create: `resources/js/pages/registration/visit/show/index.tsx`
- Create: `resources/js/pages/registration/visit/components/encounter-form.tsx`
- Create: `resources/js/pages/registration/visit/components/encounter-filters.tsx`

- [ ] **Step 1:** Buat tipe TypeScript di `registration.ts` (`Encounter`, `Queue`, `InsuranceCoverage`, `EncounterFilters`).
- [ ] **Step 2:** Buat `home/index.tsx`: Ringkasan modul pendaftaran, kartu antrean aktif, dan tombol akses cepat.
- [ ] **Step 3:** Buat `visit/list/index.tsx`: Tabel daftar kunjungan pasien, badge status kunjungan & antrean, filter tanggal/unit/status di URL.
- [ ] **Step 4:** Buat `visit/create/index.tsx` & `encounter-form.tsx`:
    - Integrasi `PatientPicker` untuk seleksi berkas rekam medis pasien aktif.
    - Dropdown pemilihan Unit dan Dokter (dengan badge ketersediaan jadwal hari ini).
    - Pemilihan Penjamin (Umum / BPJS / Asuransi Swasta) dengan input No. Kartu.
    - Modal dialog konfirmasi jika terdeteksi kemungkinan kunjungan ganda.
- [ ] **Step 5:** Buat `visit/show/index.tsx`: Rincian berkas kunjungan, riwayat nomor antrean, dan dialog pembatalan dengan alasan.

---

### Task 8: Frontend Queue Board & Polling

**Files:**

- Create: `resources/js/pages/registration/queue/board/index.tsx`
- Create: `resources/js/pages/registration/queue/components/queue-card.tsx`
- Create: `resources/js/pages/registration/queue/components/queue-calling-dialog.tsx`

- [ ] **Step 1:** Buat `queue/board/index.tsx`:
    - Tampilan papan antrean unit live.
    - Polling live antrean menggunakan `usePoll(5000)` dari `@inertiajs/react`.
    - Tombol aksi pemanggilan antrean berikutnya (`Panggil Antrean`, `Layani`, `Selesai`, `Lewati`) dibungkus `<Can permission="registration.queue.call">`.
    - Visual status antrean: Sedang Dilayani (highlight utama), Sedang Dipanggil (pulse animate), Menunggu (daftar antrean).
- [ ] **Step 2:** Pastikan seluruh komponen 100% menggunakan semantik CSS/shadcn tanpa hardcoded tailwind colors.

---

### Task 9: Verification & Roadmap Documentation

**Files:**

- Modify: `docs/tasks/03-pendaftaran.md`
- Modify: `docs/tasks/README.md`

- [ ] **Step 1:** Perbarui checklist di `docs/tasks/03-pendaftaran.md`.
- [ ] **Step 2:** Jalankan seluruh verifikasi:
    ```bash
    npm run types:check
    npm run check
    npm run build && npm run build:ssr
    vendor/bin/pint --format agent
    php artisan test --compact
    ```
- [ ] **Step 3:** Commit seluruh pengerjaan ke git branch `main`.
