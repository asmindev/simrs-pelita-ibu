# Master Data Obat & Kategori Obat (Drug & Drug Category) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul Master Data Obat dan Kategori Obat (`drugs` & `drug_categories`) lengkap dengan audit logging, validasi FormRequest, otorisasi RBAC, pengujian fitur (Pest), dan UI Inertia React sesuai standar desain SIMRS.

**Architecture:** Backend menggunakan migration Laravel 13, model Eloquent dengan Spatie Activitylog untuk audit trail, FormRequest terpisah, dan Policy berbasis Spatie Laravel Permission. Frontend menggunakan Inertia 3 + React 19 + TypeScript di `resources/js/pages/master-data/drug/` dengan komponen filter, form, dan modal dialog untuk kategori obat, mematuhi aturan tanpa hardcoded warna dan semantic tokens shadcn.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia.js 3, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Pest 4, Spatie Permission & Activitylog.

**Spec:** [docs/prd/master-data.md](file:///home/labubu/Projects/simrs/docs/prd/master-data.md), [docs/tasks/02-master-data.md](file:///home/labubu/Projects/simrs/docs/tasks/02-master-data.md)

## Global Constraints

- Frontend feature-based langsung di `resources/js/pages/master-data/drug/` (tidak ada folder features/ atau re-export).
- Dilarang hardcode warna (seperti `bg-lime-50`, `text-emerald-800`, dll.); selalu gunakan variabel semantik dari shadcn / `app.css`.
- Teks UI dalam Bahasa Indonesia; identifier kode, variabel, fungsi dalam Bahasa Inggris.
- URL selalu menggunakan Ziggy `route()`.
- Otorisasi menggunakan permission `master-data.drug.view` dan `master-data.drug.manage`.
- Seluruh verifikasi wajib lolos: `npm run types:check`, `npm run check`, `npm run build`, `vendor/bin/pint --format agent`, dan `php artisan test --compact`.

## Review Focus

1. **Uniqueness constraint kode obat:** Kode obat (`code`) harus unik dan case-insensitive / trim saat validasi; gagal menyimpan jika duplikat.
2. **Penanganan relasi kategori yang dihapus:** Kategori obat yang masih memiliki obat terkait tidak boleh dihapus (`restrictOnDelete`).
3. **Filter kombinasi (search + category + status):** Query pencarian harus bekerja mulus bersamaan dengan filter kategori obat dan status aktif/nonaktif.
4. **Keamanan otorisasi & audit trail:** User tanpa `master-data.drug.manage` ditolak (403) saat mencoba create/update/delete; setiap perubahan tersimpan di `activity_log` dengan `log_name = 'master-data'`.
5. **Format mata uang & angka klinis:** Harga obat menggunakan format rupiah terpusat `formatRupiah` dari `shared/lib/format.ts` dan kelas `tabular-nums`.

---

### Task 1: Database Migrations (`drug_categories` & `drugs`)

**Files:**

- Create: `database/migrations/2026_11_07_000003_create_drug_categories_table.php`
- Create: `database/migrations/2026_11_07_000004_create_drugs_table.php`

- [ ] **Step 1:** Buat file migration `2026_11_07_000003_create_drug_categories_table.php` dengan kolom: `id`, `name` (unique), `description` (nullable text), `timestamps`.
- [ ] **Step 2:** Buat file migration `2026_11_07_000004_create_drugs_table.php` dengan kolom:
    - `id`
    - `code` (string, unique)
    - `name` (string)
    - `drug_category_id` (foreignId constrained to `drug_categories`, restrictOnDelete)
    - `form` (string: tablet, sirup, kapsul, salep, injeksi, infus, tetes, dll.)
    - `strength` (string: e.g. "500 mg", "125 mg/5 ml")
    - `unit_of_measure` (string: tablet, botol, ampul, vial, tube, strip, sachet)
    - `price` (unsignedInteger, harga dasar dalam rupiah)
    - `manufacturer` (string, pabrik pembuat)
    - `is_active` (boolean, default true)
    - `timestamps`
    - Index: `['drug_category_id', 'is_active']`, `name`
- [ ] **Step 3:** Jalankan `php artisan migrate` dan pastikan tabel berhasil dibuat tanpa error.

---

### Task 2: Eloquent Models & Factories (`DrugCategory` & `Drug`)

**Files:**

- Create: `app/Models/DrugCategory.php`
- Create: `app/Models/Drug.php`
- Create: `database/factories/DrugCategoryFactory.php`
- Create: `database/factories/DrugFactory.php`

- [ ] **Step 1:** Buat `app/Models/DrugCategory.php` dengan `#[Fillable(['name', 'description'])]`, relasi `drugs(): HasMany`, dan `LogsActivity` (`useLogName('master-data')`).
- [ ] **Step 2:** Buat `app/Models/Drug.php` dengan:
    - `#[Fillable(['code', 'name', 'drug_category_id', 'form', 'strength', 'unit_of_measure', 'price', 'manufacturer', 'is_active'])]`
    - Casts: `'price' => 'integer'`, `'is_active' => 'boolean'`, `'drug_category_id' => 'integer'`
    - Relasi `category(): BelongsTo<DrugCategory, $this>`
    - Scope `scopeSearch(Builder $query, string $search): Builder` (mencari pada `code`, `name`, `manufacturer`)
    - Spatie `LogsActivity` (`useLogName('master-data')`)
- [ ] **Step 3:** Buat factory `DrugCategoryFactory` dan `DrugFactory` dengan state helper `inactive()`.
- [ ] **Step 4:** Jalankan `php artisan tinker --execute "App\Models\Drug::factory()->for(App\Models\DrugCategory::factory())->create();"` dan verifikasi factory berfungsi.

---

### Task 3: FormRequests & Policies

**Files:**

- Create: `app/Http/Requests/StoreDrugRequest.php`
- Create: `app/Http/Requests/UpdateDrugRequest.php`
- Create: `app/Http/Requests/StoreDrugCategoryRequest.php`
- Create: `app/Http/Requests/UpdateDrugCategoryRequest.php`
- Create: `app/Policies/DrugPolicy.php`
- Create: `app/Policies/DrugCategoryPolicy.php`

- [ ] **Step 1:** Buat `DrugPolicy` dan `DrugCategoryPolicy` yang memeriksa `MasterDataPermission::DrugView` untuk `viewAny`/`view` dan `MasterDataPermission::DrugManage` untuk `create`/`update`/`delete`.
- [ ] **Step 2:** Buat `StoreDrugRequest` dengan validasi:
    - `code`: `['required', 'string', 'max:50', 'unique:drugs,code']`
    - `name`: `['required', 'string', 'max:255']`
    - `drug_category_id`: `['required', 'integer', 'exists:drug_categories,id']`
    - `form`: `['required', 'string', 'max:100']`
    - `strength`: `['required', 'string', 'max:100']`
    - `unit_of_measure`: `['required', 'string', 'max:50']`
    - `price`: `['required', 'integer', 'min:0']`
    - `manufacturer`: `['required', 'string', 'max:255']`
    - `is_active`: `['boolean']`
- [ ] **Step 3:** Buat `UpdateDrugRequest` dengan validasi yang sama dan rule ignore unique code untuk instance `$this->route('drug')`.
- [ ] **Step 4:** Buat `StoreDrugCategoryRequest` dan `UpdateDrugCategoryRequest` untuk nama kategori unik dan deskripsi opsional.

---

### Task 4: Controllers & Web Routes

**Files:**

- Create: `app/Http/Controllers/DrugController.php`
- Create: `app/Http/Controllers/DrugCategoryController.php`
- Modify: `routes/web.php`

- [ ] **Step 1:** Buat `DrugCategoryController` dengan method:
    - `store(StoreDrugCategoryRequest $request): RedirectResponse`
    - `update(UpdateDrugCategoryRequest $request, DrugCategory $drugCategory): RedirectResponse`
    - `destroy(DrugCategory $drugCategory): RedirectResponse` (menolak jika memiliki obat terkait)
- [ ] **Step 2:** Buat `DrugController` dengan method:
    - `index(Request $request): Response` (mendukung filter search, category, status, dan paginasi 15 item)
    - `create(): Response` (mengirim daftar `categories` aktif)
    - `store(StoreDrugRequest $request): RedirectResponse`
    - `edit(Drug $drug): Response`
    - `update(UpdateDrugRequest $request, Drug $drug): RedirectResponse`
    - `destroy(Drug $drug): RedirectResponse`
- [ ] **Step 3:** Daftarkan route di `routes/web.php` dalam grup `master-data.` dengan middleware permission yang sesuai.
- [ ] **Step 4:** Jalankan `php artisan ziggy:generate resources/js/types/ziggy --types-only` untuk sinkronisasi tipe Ziggy.

---

### Task 5: Feature Tests (Pest)

**Files:**

- Create: `tests/Feature/MasterData/DrugTest.php`
- Create: `tests/Feature/MasterData/DrugCategoryTest.php`

- [ ] **Step 1:** Buat `tests/Feature/MasterData/DrugCategoryTest.php`:
    - Test permission view / manage
    - Test store kategori baru
    - Test update kategori
    - Test destroy kategori berhasil jika kosong
    - Test destroy gagal jika ada obat terkait
    - Test pencatatan activity log
- [ ] **Step 2:** Buat `tests/Feature/MasterData/DrugTest.php`:
    - Test factory pembuatan obat
    - Test index list obat dengan paginasi dan filter (search nama/kode/pabrik, filter kategori, status aktif)
    - Test otorisasi: user dengan permission `master-data.drug.view` hanya bisa melihat
    - Test user tanpa permission ditolak (403)
    - Test store obat baru dengan validasi field unik
    - Test update obat
    - Test soft delete / destroy obat
    - Test pencatatan audit log `master-data` pada created & updated
- [ ] **Step 3:** Jalankan `php artisan test --filter=Drug` dan pastikan seluruh test lolos 100%.

---

### Task 6: Frontend Pages & Components

**Files:**

- Create: `resources/js/pages/master-data/drug/types/index.ts`
- Create: `resources/js/pages/master-data/drug/components/drug-filters.tsx`
- Create: `resources/js/pages/master-data/drug/components/drug-form.tsx`
- Create: `resources/js/pages/master-data/drug/components/drug-category-dialog.tsx`
- Create: `resources/js/pages/master-data/drug/list/index.tsx`
- Create: `resources/js/pages/master-data/drug/create/index.tsx`
- Create: `resources/js/pages/master-data/drug/edit/index.tsx`

- [ ] **Step 1:** Definisikan tipe TypeScript di `resources/js/pages/master-data/drug/types/index.ts` (`Drug`, `DrugCategory`, `DrugFilters`, `DrugFormData`).
- [ ] **Step 2:** Buat `drug-filters.tsx` dengan search input, select kategori obat, select status (semua/aktif/nonaktif), sinkron ke URL query string.
- [ ] **Step 3:** Buat `drug-category-dialog.tsx` untuk menambah atau mengelola kategori obat langsung dari form obat.
- [ ] **Step 4:** Buat `drug-form.tsx` menggunakan `useForm` dari `@inertiajs/react` dengan styling semantik shadcn, validasi inline, dan tombol cancel/submit.
- [ ] **Step 5:** Buat `list/index.tsx` dengan `PageHeader`, `DataTable`, badge status (`default` untuk aktif, `outline` untuk nonaktif), format harga mata uang rupiah `formatRupiah`, serta tombol edit/delete yang dibungkus `<Can permission="master-data.drug.manage">`.
- [ ] **Step 6:** Buat `create/index.tsx` dan `edit/index.tsx`.

---

### Task 7: Navigation & Master Data Landing Integration

**Files:**

- Modify: `resources/js/shared/config/navigation.ts`
- Modify: `resources/js/pages/master-data/home/index.tsx`

- [ ] **Step 1:** Tambahkan `'master-data.drug.view'` pada array permission navigasi Master Data di `navigation.ts`.
- [ ] **Step 2:** Tambahkan kartu "Obat & Farmasi" di `resources/js/pages/master-data/home/index.tsx` dibungkus `<Can permission="master-data.drug.view">`.

---

### Task 8: Verification & Documentation Updates

**Files:**

- Modify: `docs/tasks/02-master-data.md`

- [ ] **Step 1:** Update checklist di `docs/tasks/02-master-data.md` untuk item obat & kategori obat.
- [ ] **Step 2:** Jalankan pemeriksaan wajib:
    ```bash
    npm run types:check
    npm run check
    npm run build && npm run build:ssr
    vendor/bin/pint --format agent
    php artisan test --compact
    ```
- [ ] **Step 3:** Buat commit git yang terstruktur untuk seluruh modul master data obat.
