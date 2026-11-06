# Struktur Proyek

## Prinsip

- Frontend **feature-based langsung di `resources/js/pages`**. Tidak ada folder
  `features/`.
- `pages/<domain>/index.tsx` adalah implementasi halaman, bukan re-export.
- Folder domain tidak boleh mengimpor domain lain. Kode generik naik ke
  `shared/`.
- Folder pendukung di dalam domain: `components/`, `hooks/`, `types/`, `lib/`.
- Nama halaman dan folder memakai `lowercase-kebab` agar cocok dengan path Linux
  dan `@vite` per halaman di `app.blade.php`.

## Frontend (terpasang)

```
resources/js/
  app.tsx                       # createInertiaApp + default layout
  pages/                        # route tree sekaligus feature root
    welcome.tsx
    auth/
      login.tsx
      forgot-password.tsx
      reset-password.tsx
    master-data/
      index.tsx                 # implementasi halaman
      components/
      hooks/
      types/
      lib/
      patient/                  # contoh halaman turunan
        index.tsx
        create.tsx
    registration/
      index.tsx
      components/
      hooks/
      types/
      lib/
      visit/
        index.tsx
        create.tsx
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

## Batas komponen

| Lokasi                      | Isi                                                                       | Boleh tahu domain?       |
| --------------------------- | ------------------------------------------------------------------------- | ------------------------ |
| `shared/ui`                 | Primitive shadcn                                                          | Tidak                    |
| `shared/components`         | Komposisi generik (DataTable, PageHeader, EmptyState, Can, ConfirmDialog) | Tidak                    |
| `pages/<domain>/components` | Komponen domain (PatientPicker, QueueCard)                                | Ya, hanya domain sendiri |
| `pages/<domain>/index.tsx`  | Implementasi + komposisi halaman                                          | Ya                       |

Pengecualian lintas domain yang disetujui:

- `shared/components/patient-context-bar.tsx` + `PatientSummary` di
  `shared/types` karena dipakai rekam medis, farmasi, kasir, dan penunjang.

Kode generik dipindahkan ke `shared/` sejak awal (keputusan proyek). Kode yang
mengetahui konsep domain tetap di `pages/<domain>/`.

## Multi-halaman per domain

Struktur mencerminkan URL:

```
pages/master-data/index.tsx
pages/master-data/patient/index.tsx
pages/master-data/patient/create.tsx
pages/master-data/patient/edit.tsx
```

Pemetaan backend:

```php
Inertia::render('master-data/patient/create');
```

File: `resources/js/pages/master-data/patient/create.tsx`.

Halaman error: `pages/errors/{403,404,500}.tsx` dengan komponen bersama
`shared/components/error-page.tsx`.

## Batas import

Ditegakkan oleh `scripts/check-import-boundaries.mjs` yang dijalankan lewat
`npm run check`:

- `pages/<domain-a>` tidak boleh mengimpor `pages/<domain-b>`.
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
