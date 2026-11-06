# Struktur Proyek

## Prinsip

- Frontend **feature-based langsung di `resources/js/pages`**. Tidak ada folder
  `features/`.
- Setiap halaman Inertia adalah folder dengan `index.tsx`. Nama komponen di
  `Inertia::render` adalah path folder ditambah `/index`.
- Halaman daftar memakai folder `list`; landing domain memakai `home`;
  create/edit memakai `create`/`edit`.
- Folder pendukung mengikuti tingkat pemakaian: route, resource, domain, lalu
  `shared/`.
- Tidak ada `utils/` atau `helpers/`. Fungsi murni masuk `lib`; state/perilaku
  masuk `hooks`.
- Domain tidak boleh mengimpor domain lain. Kode generik naik ke `shared/`.
- Nama folder memakai `lowercase-kebab` agar cocok dengan path Linux dan
  `@vite` per halaman di `app.blade.php`.

## Frontend (terpasang)

```
resources/js/
  app.tsx                       # createInertiaApp + default layout
  pages/                        # route tree sekaligus feature root
    welcome/
      home/index.tsx
    auth/
      login/index.tsx
      forgot-password/index.tsx
      reset-password/index.tsx
    errors/
      403/index.tsx
      404/index.tsx
      500/index.tsx
    master-data/
      home/index.tsx
      components/               # dipakai >1 resource master-data
      hooks/
      types/
      lib/
      patient/
        list/index.tsx
        create/index.tsx
        edit/index.tsx
        components/             # PatientForm/PatientFilters
        hooks/                  # use-patient-duplicates
        types/
        lib/
      doctor/
        list/index.tsx
        create/index.tsx
        edit/index.tsx
        components/
        types/
      unit/
        list/index.tsx
        create/index.tsx
        edit/index.tsx
        components/
        types/
    registration/
      home/index.tsx
      components/
      hooks/
      types/
      lib/
      visit/
        list/index.tsx
        create/index.tsx
  shared/
    ui/                         # primitive shadcn (button, input, dialog, ...)
    components/                 # komposisi generik lintas domain
    layouts/                    # AppLayout dan sub-layout domain
    hooks/                      # hook lintas domain
    lib/                        # route, format, utils
    types/                      # kontrak lintas domain
    config/                     # navigation
  types/                        # auth, global, ziggy generated
scripts/
  check-import-boundaries.mjs   # penegak batas import
```

Folder `components/`, `hooks/`, `types/`, dan `lib/` di dalam folder route
dibuat hanya jika route itu punya kode khusus. Jangan membuat folder kosong.

## Batas komponen

| Lokasi                                          | Isi                                                                       | Boleh tahu domain?   |
| ----------------------------------------------- | ------------------------------------------------------------------------- | -------------------- |
| `shared/ui`                                     | Primitive shadcn                                                          | Tidak                |
| `shared/components`                             | Komposisi generik (DataTable, PageHeader, EmptyState, Can, ConfirmDialog) | Tidak                |
| `pages/<domain>/components`                     | Komposisi lintas resource dalam domain                                    | Ya, domain sendiri   |
| `pages/<domain>/<resource>/components`          | Komposisi lintas route dalam resource                                     | Ya, resource sendiri |
| `pages/<domain>/<resource>/<action>/components` | Komponen khusus route                                                     | Ya, route sendiri    |
| `pages/<domain>/<resource>/<action>/index.tsx`  | Implementasi + komposisi halaman                                          | Ya                   |

Aturan promosi: route → resource → domain → `shared/`. Naik satu lapisan saat
dipakai oleh 2+ route/resource/domain. Jangan promosi sebelum ada pemakai kedua.

Pengecualian lintas domain yang disetujui:

- `shared/components/patient-context-bar.tsx` + `PatientSummary` di
  `shared/types` karena dipakai rekam medis, farmasi, kasir, dan penunjang.

## Multi-halaman per domain

```
pages/master-data/patient/list/index.tsx
pages/master-data/patient/create/index.tsx
pages/master-data/patient/edit/index.tsx
```

Pemetaan backend:

```php
Inertia::render('master-data/patient/create/index');
```

File: `resources/js/pages/master-data/patient/create/index.tsx`.

Halaman error: `pages/errors/{403,404,500}/index.tsx` dengan komponen bersama
`shared/components/error-page.tsx`.

## Batas import

Ditegakkan oleh `scripts/check-import-boundaries.mjs` yang dijalankan lewat
`npm run check`:

- `pages/<domain-a>` tidak boleh mengimpor `pages/<domain-b>`.
- Folder route tidak boleh mengimpor folder route lain.
- Kode bersama resource tidak boleh mengimpor route; kode bersama domain tidak
  boleh mengimpor resource/route.
- Halaman tidak boleh mengimpor halaman lain.
- File langsung di `pages/` tidak boleh mengimpor folder domain.
- `shared/` tidak boleh mengimpor `pages/`.
- Import ke `features/` dianggap error karena folder tersebut sudah dihapus.

Jalankan manual:

```
npm run check:boundaries
```

## Backend (terpasang + rencana)

```
app/
  Actions/Fortify/
  Concerns/
  Http/
    Controllers/
    Middleware/
    Requests/
  Models/
  Providers/
  Policies/                       # UnitPolicy, PatientPolicy, PatientAccessLogPolicy, BreakGlassGrantPolicy
  Enums/Permissions/              # enum permission per domain
  Enums/RoleName.php              # role baseline
  Enums/UnitType.php              # tipe unit
  Enums/PatientGender.php         # jenis kelamin pasien
  Support/PermissionRegistry.php  # agregasi semua enum
  Support/RbacAudit.php           # activity log RBAC
  Support/PatientAccessLogger.php # audit akses pasien
  Console/Commands/GeneratePermissionTypes.php # simrs:permissions --types
routes/
  web.php
  console.php
config/
  ziggy.php                       # whitelist route untuk FE
database/
  migrations/
  seeders/                        # DatabaseSeeder, PermissionSeeder, RoleSeeder
```

Jangan membuat folder basis baru (mis. `modules/`) tanpa persetujuan.

## Route frontend

- Semua URL dibuat lewat `route()` dari Ziggy (`@/shared/lib/route`).
- Whitelist route ada di `config/ziggy.php` per domain.
- Tipe route di-generate ke `resources/js/types/ziggy.d.ts`.
- Nav memakai `route().has()` sehingga item domain muncul setelah route backend
  tersedia.
- Setelah route berubah:

```
php artisan ziggy:generate resources/js/types/ziggy --types-only
```
