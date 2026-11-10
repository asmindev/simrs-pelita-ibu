# System Design

## 1. Tujuan dan batasan

SIMRS untuk satu fasilitas. Rilis pertama mencakup delapan domain: master data,
pendaftaran, rekam medis, farmasi, kasir/billing, penunjang, rawat inap, serta
RBAC/audit. Backend memakai Laravel konvensional; frontend memakai Inertia +
React dengan arsitektur feature-based.

Batasan yang disepakati:

- Satu fasilitas, bukan multi-cabang. Spatie teams **OFF**.
- Server state dikelola Inertia; tidak ada cache client untuk data pasien.
- Frontend hanya penentu UX. Backend selalu penentu otorisasi.
- Tidak ada E2E test; frontend memakai Vitest untuk logic/hook.

## 2. Arsitektur tingkat tinggi

```
Browser
  |
  | Inertia request / Inertia response
  v
Laravel route + middleware (auth, verified, permission)
  |
  +--> Controller / Inertia::render('domain/halaman/index')
  |        |
  |        +--> Policy (scoping baris) + FormRequest (validasi)
  |
  +--> HandleInertiaRequests (share auth, roles, permissions)
  |
  v
resources/views/app.blade.php
  |-- @routes (Ziggy whitelist)
  |-- @vite([css, app.tsx, pages/{component}.tsx])
  v
resources/js/pages/<domain>/<halaman>/index.tsx  (implementasi halaman)
  |-- components/, hooks/, types/, lib/  (route/resource/domain)
  |-- shared/ui, shared/components, shared/hooks
  v
React render
```

## 3. Alur request

1. Route Laravel menjalankan middleware `auth`, `verified`, dan permission.
2. Controller memuat data, menerapkan Policy/query scope, lalu memanggil
   `Inertia::render('domain/halaman/index', $props)`.
3. `HandleInertiaRequests` membagikan `auth.user`, `auth.roles`,
   `auth.permissions`, dan `name`.
4. Halaman di `resources/js/pages/<domain>/` adalah implementasi domain.
5. Komponen memakai props Inertia. Tidak ada fetch tambahan kecuali polling
   eksplisit.

## 4. Arsitektur frontend

### 4.1 Feature-based di pages

- Implementasi domain langsung di `resources/js/pages/<domain>/`.
- Tidak ada folder `features/` dan tidak ada halaman re-export.
- Setiap halaman adalah folder dengan `index.tsx`; nama komponen di
  `Inertia::render` adalah path folder ditambah `/index`.
- Halaman daftar memakai folder `list`, landing domain memakai `home`,
  create/edit memakai `create`/`edit`.
- Folder pendukung mengikuti tingkat pemakaian: route, resource, domain, lalu
  `shared/`. Tidak ada `utils/` atau `helpers/`.
- Tidak ada import antar-domain. Data lintas domain lewat props Inertia atau
  kontrak di `shared/types`.
- Batas import ditegakkan `scripts/check-import-boundaries.mjs` lewat
  `npm run check`.

### 4.2 Lapisan shared

- `shared/ui`: primitive shadcn, dipakai langsung.
- `shared/components`: komposisi generik lintas domain.
- `shared/layouts`: shell aplikasi dan sub-layout domain.
- `shared/hooks`: perilaku lintas domain (`usePermissions`, `usePoll`,
  `useDebouncedValue`, `useUnsavedChanges`, `useTableFilters`).
- `shared/lib`: `route`, `format`, `utils`.
- `shared/types`: kontrak lintas domain.

Keputusan proyek: hook dan komponen dibuat sejak awal untuk setiap fitur, bukan
menunggu pemakaian kedua. Kode yang dipakai beberapa route naik ke resource,
yang dipakai beberapa resource naik ke domain, dan yang dipakai 2+ domain naik
ke `shared/`. Kode yang mengetahui konsep domain tetap di `pages/<domain>/`.
Tetap hindari hook yang hanya meneruskan props.

### 4.3 Hook vs komponen

- Hook mengembalikan state/perilaku, tidak mengembalikan JSX.
- Komponen mengembalikan JSX.
- Izin: `usePermissions()` untuk logika, `<Can>` untuk markup.
- `useForm` dipakai langsung per halaman; tidak ada wrapper generik.

### 4.4 Layout

- `AppLayout` global untuk halaman terautentikasi dengan sidebar yang bisa
  diciutkan; navigasi mobile memakai sheet.
- Dashboard global di `/dashboard`, menjadi tujuan redirect setelah login.
- Sub-layout per domain memakai layout array Inertia v3; contoh clinical layout
  dengan patient context bar untuk rekam medis, farmasi, kasir, penunjang.
- `welcome/*` dan `auth/*` tidak memakai `AppLayout`.

### 4.5 Navigasi

- `shared/config/navigation.ts` mendefinisikan grup menu, item, `routeName`, dan
  `permission`.
- Item tampil jika `route().has(routeName)` dan `can(permission)`.
- Menu tanpa izin disembunyikan sepenuhnya.

### 4.6 Form dan validasi

- `useForm` Inertia + validasi utama di FormRequest.
- Constraint HTML untuk umpan balik cepat.
- Form panjang (rekam medis/asesmen) menyimpan draft ke backend dan memakai
  guard perubahan belum disimpan.
- Create/edit entitas kompleks memakai halaman penuh; dialog hanya untuk aksi
  ringan.

### 4.7 Tabel dan filter

- **Standarisasi Desain Tabel (`DataTable`)**:
  - Seluruh tabel di aplikasi (baik halaman daftar utama, modal, tab, maupun detail riwayat) wajib menggunakan komponen terpadu `DataTable` dari `@/shared/components/data-table`.
  - Dilarang membungkus tabel secara inkonsisten (misal manual wrapper border/card ganda di luar `DataTable`).
  - Seluruh tabel wajib menyertakan header dan ringkasan toolbar standar melalui `TableToolbar` (`@/shared/components/table-toolbar`), minimal memuat:
    - Judul tabel (`title`) & deskripsi konteks (`description`).
    - Ikon modul/entitas (`icon`).
    - Indikator counter baris data (`current` & `total`).
    - Input pencarian cepat (*search field*) di sisi kanan toolbar untuk kenyamanan pengguna saat memfilter data.
    - **Konsistensi Background Input Toolbar**: Setiap input field (seperti search input, text input, dan select trigger dropdown) di dalam toolbar tabel **wajib memakai kelas `bg-background`** (bukan tombol / button) agar kontras terhadap background toolbar `bg-muted` tetap tajam, konsisten, dan rapi di seluruh sistem.
- API `DataTable` props-only (`columns`, `rows`, `rowKey`, `empty`, `toolbar`, `footer`).
- Filter/sort/page/search pada halaman utama disimpan di query string; reload dengan `router.get(..., { preserveState: true, preserveScroll: true })`.
- Data tabel pada halaman daftar utama selalu dipaginasi server-side.

### 4.8 State

- Server state: props Inertia, tanpa cache client.
- State UI global: React Context (sidebar, konteks pasien aktif).
- Tidak memakai store global untuk data server.

### 4.9 i18n

- `react-i18next` dipakai sejak awal (PLANNED).
- Bahasa default Indonesia; kode tetap Bahasa Inggris.
- Format tanggal/uang terpusat di `shared/lib/format.ts`.

### 4.10 Cetak

- Resep, invoice, label, dan hasil lab dibuat PDF di backend.
- Halaman biasa memakai CSS `@media print`.
- Frontend tidak membangun PDF di browser.

### 4.11 Polling

- Hook `usePoll` per halaman kritis (antrean, hasil lab, ketersediaan bed).
- Interval eksplisit, berhenti saat tab tidak aktif, memakai
  `router.reload({ only: [...] })`.

## 5. RBAC

### 5.1 Keputusan

| Topik             | Keputusan                                     | Status |
| ----------------- | --------------------------------------------- | ------ |
| Library           | `spatie/laravel-permission`                   | DONE   |
| Fasilitas         | Satu fasilitas, teams OFF                     | LOCKED |
| Model akses       | Role-only, tanpa direct permission            | LOCKED |
| Super-admin       | `Gate::before` hanya untuk role `super-admin` | LOCKED |
| Scoping baris     | Policy + query scope berbasis unit            | LOCKED |
| Sumber permission | Enum/registry per domain                      | LOCKED |
| Format nama       | `domain.resource.action`                      | LOCKED |
| Share ke FE       | `auth.roles` + `auth.permissions`             | LOCKED |
| Guard FE          | Sembunyikan aksi tanpa izin                   | LOCKED |
| 403               | Halaman Inertia + break-glass                 | LOCKED |
| Field sensitif    | Backend omit + FE hide                        | LOCKED |
| Audit             | Activity log + audit akses pasien             | LOCKED |
| UI RBAC v1        | Seeder/CLI, UI menyusul                       | LOCKED |

### 5.2 Role baseline

| Role           | Tanggung jawab                          |
| -------------- | --------------------------------------- |
| `super-admin`  | Bypass semua cek, dikelola terbatas     |
| `admin`        | Konfigurasi master data dan operasional |
| `registration` | Registrasi pasien dan kunjungan         |
| `doctor`       | Rekam medis dan order penunjang         |
| `nurse`        | Asesmen, tindakan, rawat inap           |
| `pharmacist`   | Resep, dispensing, stok                 |
| `cashier`      | Invoice, pembayaran, klaim              |
| `lab-analyst`  | Order dan hasil laboratorium            |
| `radiographer` | Order dan hasil radiologi               |
| `management`   | Laporan read-only                       |
| `auditor`      | Audit log read-only                     |

Role dapat disesuaikan saat implementasi, tetapi permission tetap
`domain.resource.action`.

`super-admin` tidak diberi permission eksplisit. Backend memakai
`Gate::before`; FE menerima seluruh `PermissionRegistry::all()` agar aksi tetap
tampil.

### 5.3 Registry permission

- Setiap domain punya enum di `app/Enums/Permissions/<Domain>Permission.php`.
- `app/Support/PermissionRegistry.php` menggabungkan semua case.
- `database/seeders/PermissionSeeder.php` memakai `findOrCreate` (idempotent).
- Role di-seed oleh `RoleSeeder` dan diberi permission secara eksplisit.
- Command `simrs:permissions --types` men-generate
  `resources/js/types/permissions.d.ts` berisi union nama permission dan role.

Contoh permission:

```
master-data.patient.view
master-data.patient.create
master-data.patient.update
master-data.patient.delete
registration.visit.create
medical-record.encounter.update
medical-record.sensitive-note.view
pharmacy.prescription.verify
cashier.invoice.void
diagnostics.result.verify
inpatient.transfer.create
rbac.role.assign
audit.log.view
```

### 5.4 Penegakan

| Lapis | Alat                     | Contoh                                                |
| ----- | ------------------------ | ----------------------------------------------------- |
| Route | Middleware `permission`  | `->middleware('permission:master-data.patient.view')` |
| Aksi  | Policy                   | `$this->authorize('update', $patient)`                |
| Baris | Query scope di Policy    | dokter hanya unit polinya                             |
| Field | FormRequest/Resource     | omit field sensitif                                   |
| FE    | `Can` / `usePermissions` | sembunyikan tombol                                    |

Registrasi alias middleware spatie (`role`, `permission`,
`role_or_permission`) dilakukan di `bootstrap/app.php`.

### 5.5 Scoping baris

Spatie menjawab “boleh melakukan aksi”, bukan “baris mana”.

- Tabel `units` dengan tipe `outpatient`, `inpatient`, `emergency`,
  `laboratory`, `radiology`, `pharmacy`, `other`.
- Pivot `user_unit` dengan `user_id`, `unit_id`, `is_primary`.
- `User::unitIds()`, `User::hasUnitAccess()`, dan `User::primaryUnit()` menjadi
  sumber scoping. Policy per model domain memfilter query berdasarkan unit user.
- Contoh: dokter hanya kunjungan di poli yang ditugaskan; perawat hanya ruang
  rawat inap yang ditugaskan.
- Manajemen dan auditor mendapat akses read-only lintas unit lewat permission,
  bukan dengan mematikan Policy.
- Implementasi saat ini: `UnitPolicy`, `PatientAccessLogPolicy`,
  `BreakGlassGrantPolicy`. Query scope domain menyusul saat model kunjungan ada.

### 5.6 Kontrak frontend

Backend (`HandleInertiaRequests`):

```php
'auth' => [
    'user' => $user,
    'roles' => $user?->getRoleNames() ?? [],
    'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
],
```

Frontend:

```tsx
const { can, canAny, canAll, hasRole } = usePermissions();

<Can permission="master-data.patient.create">
    <Button>Tambah pasien</Button>
</Can>;
```

Perilaku:

- `super-admin` menerima seluruh `PermissionRegistry::all()` agar aksi tampil.
- Aksi tanpa izin disembunyikan.
- URL langsung ke halaman tanpa izin menghasilkan 403.
- Payload permission dikirim setiap request; aman selama jumlah permission
  wajar (di bawah sekitar 300). Jika membesar, evaluasi pengiriman per halaman.
- Guard FE bukan kontrol keamanan.

### 5.7 Field sensitif

- Contoh: status HIV, catatan psikiatri, diagnosis kejiwaan.
- Backend tidak mengirim field jika user tidak punya permission.
- FE tetap membungkus dengan `Can` untuk konsistensi UI.
- Jangan pernah mengandalkan `hidden` di FE atau menyamarkan di client.

### 5.8 Break-glass

- Untuk kondisi darurat (IGD) tanpa permission normal.
- Modal di halaman 403: user mengisi alasan, backend memberi akses sementara.
- Data yang disimpan: `user_id`, `patient_id`, alasan, `granted_at`,
  `expires_at`, `revoked_at`, `reviewed_by_id`, `reviewed_at`, `review_notes`.
- Setiap penggunaan tercatat di audit dan ditinjau oleh auditor.
- Permission terkait: `rbac.break-glass.request` dan `rbac.break-glass.review`.

### 5.9 Audit

- `spatie/laravel-activitylog` mencatat perubahan role, permission, dan
  assignment lewat `RbacAudit`.
- `patient_access_logs` mencatat siapa membuka/mengubah rekam medis, unit,
  aksi, konteks, IP, dan user agent lewat `PatientAccessLogger`.
- `break_glass_grants` menyimpan akses darurat dan status tinjauannya.
- `patient_id` pada kedua tabel sengaja tanpa foreign key agar riwayat audit
  tetap utuh saat pasien di-merge atau dihapus; index sudah disiapkan.
- UI audit masuk fase RBAC/Audit (v1.1). Backend sudah mencatat sejak v1.

## 6. Keamanan

- Data pasien tidak disimpan di storage browser.
- Field sensitif di-omit di server.
- Semua route domain memakai `auth` + `verified` + permission.
- Rate limit login sudah aktif (`config/fortify.php`).
- Halaman 403/404/500 memakai Inertia agar tidak membocorkan stack trace.
- Jangan mencatat data pasien atau kredensial ke log.

## 7. Penanganan error

- 403: halaman Inertia; modal break-glass menyusul.
- 404/500: halaman Inertia.
- Validasi: error dari FormRequest dikirim sebagai props error `useForm`.
- Konflik edit: backend menolak update jika `updated_at` berubah; FE menampilkan
  pesan konflik (PLANNED).

## 8. Testing

- Backend: Pest, fokus pada policy, permission matrix, dan alur kritis.
- Frontend: Vitest untuk logic/hook (formatter, permission hook, filter parser).
- Tidak ada E2E. Risiko regresi UI diterima; kompensasi dengan test logic dan
  review manual alur kritis.
- Catatan lingkungan: `phpunit.xml` memakai MySQL `simrs_test`, terpisah dari
  database pengembangan `simrs`.

## 9. Deployment dan operasional

- Build frontend: `npm run build`.
- Setelah route berubah: regenerate tipe Ziggy.
- Setelah seeder/role berubah: reset cache permission spatie
  (`php artisan permission:cache-reset`) saat deploy.
- Queue, cache, dan session memakai database; pastikan worker berjalan.

## 10. Ringkasan status implementasi

| Area                                                              | Status      |
| ----------------------------------------------------------------- | ----------- |
| Feature skeleton di `pages/<domain>`                              | Implemented |
| Ziggy + whitelist + tipe route                                    | Implemented |
| Import boundary check di `npm run check`                          | Implemented |
| `AppLayout`, `PageHeader`, `EmptyState`, `DataTable`, `Can` dasar | Implemented |
| `usePermissions` dasar                                            | Implemented |
| Upgrade `Can` (any/all), `usePoll`, `useUnsavedChanges`           | PLANNED     |
| Permission type generator                                         | PLANNED     |
| spatie + registry + seeder + middleware                           | PLANNED     |
| Policy + unit scoping                                             | PLANNED     |
| 403 + break-glass                                                 | PLANNED     |
| Audit access pasien                                               | PLANNED     |
| react-i18next                                                     | PLANNED     |
| Vitest                                                            | PLANNED     |
