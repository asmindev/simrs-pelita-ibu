# Master Data Guarantors & Tariffs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD master data for Penjamin (`guarantors`) and Tarif Layanan/Tindakan (`tariffs`) with RBAC authorization, audit logging, and Inertia React UI.

**Architecture:** Laravel 13 backend using Eloquent models, Spatie Activitylog, FormRequests, and Policies paired with Inertia 3 + React 19 frontend pages. All state is query-string synchronized via standard Inertia visits; UI actions are guarded by permissions via `Can` and `usePermissions`.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia.js 3, React 19, TypeScript, Tailwind CSS v4, Pest PHP.

**Spec:** [`docs/prd/master-data.md`](file:///home/labubu/Projects/simrs/docs/prd/master-data.md) and [`docs/tasks/02-master-data.md`](file:///home/labubu/Projects/simrs/docs/tasks/02-master-data.md).

## Global Constraints

- Frontend feature-based directly under `resources/js/pages/master-data/{guarantor,tariff}/`. No `features/` directory and no page re-exports.
- Domain import boundaries strictly enforced: no imports across domain pages.
- URL generation strictly via Ziggy `route()`; no hardcoded URLs.
- Server state from Inertia props; no client-side caching of patient or reference data.
- Forms use Inertia `useForm` + backend `FormRequest` validation; no generic form wrappers.
- Table filtering, search, and pagination synchronized via URL query strings.
- Permission format `domain.resource.action`: `master-data.guarantor.{view,manage}` and `master-data.tariff.{view,manage}`.
- UI text in Bahasa Indonesia; code symbols (classes, methods, variables) in English.
- Every mutating action logged via Spatie Activitylog under log name `master-data`.
- Verification suite: `npm run types:check`, `npm run check`, `npm run build`, and `vendor/bin/pint --format agent`.

## Review Focus

1. Duplicate codes: Attempting to register or update a guarantor or tariff with a duplicate `code` must fail validation with a friendly error message.
2. Inactive unit binding: Creating a tariff bound to an inactive or non-existent `unit_id` must fail validation.
3. Negative or zero pricing: Creating or updating a tariff with a price < 0 or non-numeric must fail validation.
4. Authorization enforcement: Users without `master-data.guarantor.view` or `master-data.tariff.view` must receive a 403 Forbidden response on index; users without `manage` must receive 403 on store, update, and destroy.
5. Soft/Audit protection: Deletion or status change must be recorded in Spatie activity log for traceability.

---

### Task 1: Guarantor Backend Foundation (Migration, Enum, Model, Factory, Policy)

**Files:**

- Create: `database/migrations/2026_11_07_000001_create_guarantors_table.php`
- Create: `app/Enums/GuarantorType.php`
- Create: `app/Models/Guarantor.php`
- Create: `database/factories/GuarantorFactory.php`
- Create: `app/Policies/GuarantorPolicy.php`
- Modify: `app/Providers/AppServiceProvider.php` (if needed for policy binding, or automatic discovery)
- Test: `tests/Feature/MasterData/GuarantorTest.php`

**Interfaces:**

- Consumes: `MasterDataPermission::GuarantorView`, `MasterDataPermission::GuarantorManage`
- Produces: `App\Models\Guarantor`, `App\Enums\GuarantorType`, `GuarantorPolicy`

- [ ] **Step 1: Write the failing test for Guarantor model and factory**

Create `tests/Feature/MasterData/GuarantorTest.php` with initial test checking factory creation, casts, activity logging, and search scope:

```php
test('guarantor factory creates active guarantor with activity log', function () {
    $guarantor = Guarantor::factory()->create([
        'code' => 'BPJS',
        'name' => 'BPJS Kesehatan',
        'type' => GuarantorType::Bpjs,
    ]);

    expect($guarantor->code)->toBe('BPJS')
        ->and($guarantor->type)->toBe(GuarantorType::Bpjs)
        ->and($guarantor->is_active)->toBeTrue();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=GuarantorTest`
Expected: FAIL due to missing `Guarantor` class and `guarantors` table.

- [ ] **Step 3: Implement `GuarantorType` Enum, Migration, Model, Factory, and Policy**

1. Create `app/Enums/GuarantorType.php`:
    - Cases: `Bpjs = 'bpjs'`, `General = 'general'`, `Insurance = 'insurance'`, `Company = 'company'`.
    - Method: `label(): string` returning Indonesian names ('BPJS Kesehatan', 'Umum / Pribadi', 'Asuransi Swasta', 'Perusahaan').

2. Create migration `database/migrations/2026_11_07_000001_create_guarantors_table.php`:
    - Columns: `id`, `code` (string, unique), `name` (string), `type` (string), `description` (text, nullable), `is_active` (boolean, default true), `timestamps`.
    - Index on `[type, is_active]`.

3. Create model `app/Models/Guarantor.php`:
    - Fillable: `['code', 'name', 'type', 'description', 'is_active']`.
    - Casts: `'type' => GuarantorType::class`, `'is_active' => 'boolean'`.
    - Traits: `HasFactory`, `LogsActivity`.
    - Method `getActivitylogOptions()`: log name `master-data`, `logFillable()`, `logOnlyDirty()`.
    - Scope `scopeSearch(Builder $query, string $term)`: matching code or name.

4. Create factory `database/factories/GuarantorFactory.php`:
    - Default attributes: random code, name, random `GuarantorType`, `is_active => true`.
    - State `inactive()`.

5. Create policy `app/Policies/GuarantorPolicy.php`:
    - `viewAny`, `view`: check `master-data.guarantor.view`.
    - `create`, `update`, `delete`: check `master-data.guarantor.manage`.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=GuarantorTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add database/migrations/*create_guarantors_table.php app/Enums/GuarantorType.php app/Models/Guarantor.php database/factories/GuarantorFactory.php app/Policies/GuarantorPolicy.php tests/Feature/MasterData/GuarantorTest.php
git commit -m "feat(master-data): add guarantor model, migration, policy, and factory"
```

---

### Task 2: Guarantor Form Requests & Controller CRUD API

**Files:**

- Create: `app/Http/Requests/StoreGuarantorRequest.php`
- Create: `app/Http/Requests/UpdateGuarantorRequest.php`
- Create: `app/Http/Controllers/GuarantorController.php`
- Modify: `routes/web.php`
- Modify: `tests/Feature/MasterData/GuarantorTest.php`

**Interfaces:**

- Consumes: `App\Models\Guarantor`, `GuarantorPolicy`
- Produces: `GuarantorController` CRUD routes (`master-data.guarantors.*`)

- [ ] **Step 1: Write failing feature tests for Guarantor CRUD & RBAC**

Add tests to `tests/Feature/MasterData/GuarantorTest.php`:

- `test('guarantor index lists and filters guarantors')`
- `test('guarantor index requires view permission')`
- `test('admin can store valid guarantor with activity log')`
- `test('store validates unique code and required fields')`
- `test('admin can update guarantor')`
- `test('admin can toggle active status or delete guarantor')`

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=GuarantorTest`
Expected: FAIL with route not defined or 404.

- [ ] **Step 3: Implement FormRequests, Controller, and Routes**

1. Create `StoreGuarantorRequest`:
    - Rules: `code` (required, string, max:50, unique:guarantors,code), `name` (required, string, max:255), `type` (required, Rule::enum(GuarantorType::class)), `description` (nullable, string), `is_active` (boolean).

2. Create `UpdateGuarantorRequest`:
    - Rules: `code` (required, string, max:50, Rule::unique('guarantors', 'code')->ignore($this->route('guarantor'))), `name`, `type`, `description`, `is_active`.

3. Create `GuarantorController`:
    - `index`: filter by `search`, `type`, `status`. Paginate(15). Render `master-data/guarantor/list/index`.
    - `create`: authorize `create`. Render `master-data/guarantor/create/index` with types.
    - `store`: authorize `create`. Create record, redirect with flash success.
    - `edit`: authorize `update`. Render `master-data/guarantor/edit/index` with guarantor & types.
    - `update`: authorize `update`. Update record, redirect with flash success.
    - `destroy`: authorize `delete`. Delete record, redirect with flash success.

4. Register routes in `routes/web.php` under `master-data.` group with `permission:master-data.guarantor.*` middleware.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=GuarantorTest`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add app/Http/Requests/*GuarantorRequest.php app/Http/Controllers/GuarantorController.php routes/web.php tests/Feature/MasterData/GuarantorTest.php
git commit -m "feat(master-data): implement guarantor controller, requests, and feature tests"
```

---

### Task 3: Tariff Backend Foundation (Migration, Enum, Model, Factory, Policy)

**Files:**

- Create: `database/migrations/2026_11_07_000002_create_tariffs_table.php`
- Create: `app/Enums/TariffCategory.php`
- Create: `app/Models/Tariff.php`
- Create: `database/factories/TariffFactory.php`
- Create: `app/Policies/TariffPolicy.php`
- Test: `tests/Feature/MasterData/TariffTest.php`

**Interfaces:**

- Consumes: `App\Models\Unit`, `MasterDataPermission::TariffView`, `MasterDataPermission::TariffManage`
- Produces: `App\Models\Tariff`, `App\Enums\TariffCategory`, `TariffPolicy`

- [ ] **Step 1: Write failing test for Tariff model and factory**

Create `tests/Feature/MasterData/TariffTest.php` testing factory, category enum, unit relation, and activity log:

```php
test('tariff factory creates valid tariff linked optionally to a unit', function () {
    $unit = Unit::factory()->create();
    $tariff = Tariff::factory()->create([
        'code' => 'KONSUL-01',
        'name' => 'Konsultasi Dokter Umum',
        'category' => TariffCategory::Consultation,
        'price' => 50000,
        'unit_id' => $unit->id,
    ]);

    expect($tariff->price)->toBe(50000)
        ->and($tariff->unit->id)->toBe($unit->id)
        ->and($tariff->category)->toBe(TariffCategory::Consultation);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=TariffTest`
Expected: FAIL due to missing `Tariff` class and table.

- [ ] **Step 3: Implement `TariffCategory` Enum, Migration, Model, Factory, Policy**

1. Create `app/Enums/TariffCategory.php`:
    - Cases: `Consultation = 'consultation'`, `Procedure = 'procedure'`, `Laboratory = 'laboratory'`, `Radiology = 'radiology'`, `Administration = 'administration'`, `Other = 'other'`.
    - Method `label(): string` returning Indonesian text ('Konsultasi', 'Tindakan Medis', 'Laboratorium', 'Radiologi', 'Administrasi', 'Lainnya').

2. Create migration `database/migrations/2026_11_07_000002_create_tariffs_table.php`:
    - Columns: `id`, `code` (string, unique), `name` (string), `category` (string), `price` (unsignedInteger, storing amount in IDR), `unit_id` (foreignId nullable, constrained to `units` on delete null), `description` (text, nullable), `is_active` (boolean, default true), `timestamps`.
    - Index on `[category, is_active]` and `unit_id`.

3. Create model `app/Models/Tariff.php`:
    - Fillable: `['code', 'name', 'category', 'price', 'unit_id', 'description', 'is_active']`.
    - Casts: `'category' => TariffCategory::class`, `'price' => 'integer'`, `'is_active' => 'boolean'`.
    - Relations: `unit(): BelongsTo`.
    - Trait: `HasFactory`, `LogsActivity`.
    - Method `getActivitylogOptions()`: log name `master-data`.
    - Scope `scopeSearch(Builder $query, string $term)`: matching code or name.

4. Create factory `database/factories/TariffFactory.php`:
    - Default code, name, random category, price between 10000 and 500000, `is_active => true`.
    - States: `inactive()`, `withUnit()`.

5. Create policy `app/Policies/TariffPolicy.php`:
    - Check `master-data.tariff.view` for view/viewAny, `master-data.tariff.manage` for create/update/delete.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=TariffTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add database/migrations/*create_tariffs_table.php app/Enums/TariffCategory.php app/Models/Tariff.php database/factories/TariffFactory.php app/Policies/TariffPolicy.php tests/Feature/MasterData/TariffTest.php
git commit -m "feat(master-data): add tariff model, migration, policy, and factory"
```

---

### Task 4: Tariff Form Requests & Controller CRUD API

**Files:**

- Create: `app/Http/Requests/StoreTariffRequest.php`
- Create: `app/Http/Requests/UpdateTariffRequest.php`
- Create: `app/Http/Controllers/TariffController.php`
- Modify: `routes/web.php`
- Modify: `tests/Feature/MasterData/TariffTest.php`

**Interfaces:**

- Consumes: `App\Models\Tariff`, `TariffPolicy`, `App\Models\Unit`
- Produces: `TariffController` CRUD routes (`master-data.tariffs.*`)

- [ ] **Step 1: Write failing feature tests for Tariff CRUD & RBAC**

Add tests to `tests/Feature/MasterData/TariffTest.php`:

- `test('tariff index lists and filters tariffs by search, category, and unit')`
- `test('tariff index requires view permission')`
- `test('admin can create tariff with valid unit')`
- `test('store rejects duplicate code and negative price')`
- `test('admin can update tariff and change unit binding')`
- `test('admin can delete tariff')`

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=TariffTest`
Expected: FAIL with route not found.

- [ ] **Step 3: Implement Requests, Controller, and Routes**

1. Create `StoreTariffRequest`:
    - Rules: `code` (required, string, max:50, unique:tariffs,code), `name` (required, string, max:255), `category` (required, Rule::enum(TariffCategory::class)), `price` (required, integer, min:0), `unit_id` (nullable, exists:units,id), `description` (nullable, string), `is_active` (boolean).

2. Create `UpdateTariffRequest`:
    - Rules: `code` (required, Rule::unique('tariffs', 'code')->ignore($this->route('tariff'))), `name`, `category`, `price`, `unit_id`, `description`, `is_active`.

3. Create `TariffController`:
    - `index`: filter by `search`, `category`, `unit_id`, `status`. Eager-load `unit:id,name,code`. Paginate(15). Pass active units for filter dropdown. Render `master-data/tariff/list/index`.
    - `create`: authorize `create`. Pass categories and active units. Render `master-data/tariff/create/index`.
    - `store`: authorize `create`. Create record, redirect with flash success.
    - `edit`: authorize `update`. Pass tariff, categories, and active units. Render `master-data/tariff/edit/index`.
    - `update`: authorize `update`. Update record, redirect with flash success.
    - `destroy`: authorize `delete`. Delete record, redirect with flash success.

4. Register routes in `routes/web.php` under `master-data.` group with `permission:master-data.tariff.*` middleware.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=TariffTest`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add app/Http/Requests/*TariffRequest.php app/Http/Controllers/TariffController.php routes/web.php tests/Feature/MasterData/TariffTest.php
git commit -m "feat(master-data): implement tariff controller, requests, and feature tests"
```

---

### Task 5: Guarantor Frontend UI (Filters, Form, List, Create, Edit Pages)

**Files:**

- Create: `resources/js/pages/master-data/guarantor/components/guarantor-filters.tsx`
- Create: `resources/js/pages/master-data/guarantor/components/guarantor-form.tsx`
- Create: `resources/js/pages/master-data/guarantor/list/index.tsx`
- Create: `resources/js/pages/master-data/guarantor/create/index.tsx`
- Create: `resources/js/pages/master-data/guarantor/edit/index.tsx`

**Interfaces:**

- Consumes: `DataTable`, `TableToolbar`, `Pagination`, `Can`, `PageHeader`, `FormField`, `useForm`, Ziggy `route()`
- Produces: Inertia pages rendered by `GuarantorController`

- [ ] **Step 1: Generate Ziggy route types for newly registered guarantor routes**

Run: `php artisan ziggy:generate resources/js/types/ziggy --types-only`

- [ ] **Step 2: Create `guarantor-filters.tsx` & `guarantor-form.tsx`**

1. `guarantor-filters.tsx`:
    - Search input, type dropdown (`bpjs`, `general`, `insurance`, `company`), status dropdown (`active`, `inactive`).
    - Uses `TableToolbar` and synchronizes with URL query strings via Inertia `router.get`.

2. `guarantor-form.tsx`:
    - Uses Inertia `useForm`.
    - Fields: `code` (uppercase text), `name` (text), `type` (select option with labels), `description` (textarea), `is_active` (checkbox).
    - Display FormRequest validation errors cleanly.

- [ ] **Step 3: Create `list/index.tsx`, `create/index.tsx`, and `edit/index.tsx`**

1. `list/index.tsx`:
    - `DataTable` showing Kode, Nama Penjamin, Tipe (Badge), Status (Badge Aktif/Nonaktif), dan Aksi (Edit link guarded by `Can`).
    - Button "Tambah Penjamin" guarded by `Can permission="master-data.guarantor.manage"`.
    - Empty state when no data matches.

2. `create/index.tsx` & `edit/index.tsx`:
    - `PageHeader` with title and breadcrumb back to `master-data.guarantors.index`.
    - Form card container using `guarantor-form.tsx`.

- [ ] **Step 4: Verify type safety and boundaries**

Run: `npm run types:check && npm run check`
Expected: PASS (0 TypeScript errors, 0 boundary violations)

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/master-data/guarantor/ resources/js/types/ziggy.d.ts
git commit -m "feat(master-data): add guarantor frontend list, create, and edit pages"
```

---

### Task 6: Tariff Frontend UI (Filters, Form, List, Create, Edit Pages)

**Files:**

- Create: `resources/js/pages/master-data/tariff/components/tariff-filters.tsx`
- Create: `resources/js/pages/master-data/tariff/components/tariff-form.tsx`
- Create: `resources/js/pages/master-data/tariff/list/index.tsx`
- Create: `resources/js/pages/master-data/tariff/create/index.tsx`
- Create: `resources/js/pages/master-data/tariff/edit/index.tsx`

**Interfaces:**

- Consumes: `DataTable`, `TableToolbar`, `Pagination`, `Can`, `PageHeader`, `FormField`, `formatRupiah`, `useForm`, Ziggy `route()`
- Produces: Inertia pages rendered by `TariffController`

- [ ] **Step 1: Create `tariff-filters.tsx` & `tariff-form.tsx`**

1. `tariff-filters.tsx`:
    - Search input, category dropdown, unit dropdown, and status dropdown.
    - Synchronizes filter state to query string on change.

2. `tariff-form.tsx`:
    - Uses Inertia `useForm`.
    - Fields: `code` (uppercase), `name`, `category` (select option), `price` (number input with currency formatting helper), `unit_id` (select unit or "Semua Unit"), `description` (textarea), `is_active` (checkbox).
    - Display validation errors.

- [ ] **Step 2: Create `list/index.tsx`, `create/index.tsx`, and `edit/index.tsx`**

1. `list/index.tsx`:
    - `DataTable` with columns: Kode, Nama Layanan/Tarif, Kategori (Badge), Unit (Badge or "-"), Tarif (Rupiah formatted), Status (Aktif/Nonaktif), Aksi (Edit link).
    - Button "Tambah Tarif" guarded by `Can permission="master-data.tariff.manage"`.

2. `create/index.tsx` & `edit/index.tsx`:
    - Form container wrapping `tariff-form.tsx`.

- [ ] **Step 3: Verify type safety and boundaries**

Run: `npm run types:check && npm run check`
Expected: PASS (0 TypeScript errors, 0 boundary violations)

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/master-data/tariff/
git commit -m "feat(master-data): add tariff frontend list, create, and edit pages"
```

---

### Task 7: Navigation & Master Data Landing Integration + Full Verification

**Files:**

- Modify: `resources/js/shared/config/navigation.ts`
- Modify: `resources/js/pages/master-data/home/index.tsx`
- Modify: `docs/tasks/02-master-data.md`
- Test: `tests/Feature/MasterData/GuarantorTest.php`
- Test: `tests/Feature/MasterData/TariffTest.php`

**Interfaces:**

- Consumes: Registered routes, permissions
- Produces: Integrated sidebar navigation and master data overview cards

- [ ] **Step 1: Update navigation configuration and Master Data home**

1. In `resources/js/shared/config/navigation.ts`:
    - Add items under section `Master Data`:
        ```ts
        {
            title: 'Penjamin',
            routeName: 'master-data.guarantors.index',
            icon: ShieldCheck, // or HandCoins / Building
            permission: 'master-data.guarantor.view',
        },
        {
            title: 'Tarif & Tindakan',
            routeName: 'master-data.tariffs.index',
            icon: Receipt, // or BadgePercent / Tag
            permission: 'master-data.tariff.view',
        },
        ```
    - Update `master-data.index` module item permission list to include `'master-data.guarantor.view'` and `'master-data.tariff.view'`.

2. In `resources/js/pages/master-data/home/index.tsx`:
    - Add card for Penjamin (`master-data.guarantors.index`) guarded by `Can permission="master-data.guarantor.view"`.
    - Add card for Tarif (`master-data.tariffs.index`) guarded by `Can permission="master-data.tariff.view"`.

3. In `docs/tasks/02-master-data.md`:
    - Mark completed checkboxes for guarantors and tariffs.

- [ ] **Step 2: Run full verification suite**

Run the mandatory project checks:

```bash
npm run types:check
npm run check
npm run build
vendor/bin/pint --format agent
php artisan test --compact
```

Expected: All 5 commands exit with code 0.

- [ ] **Step 3: Commit**

```bash
git add resources/js/shared/config/navigation.ts resources/js/pages/master-data/home/index.tsx docs/tasks/02-master-data.md
git commit -m "feat(master-data): integrate guarantors and tariffs into navigation and master data home"
```
