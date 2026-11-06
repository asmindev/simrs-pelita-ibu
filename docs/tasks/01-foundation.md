# Fase 1 — Fondasi

Tujuan: menyiapkan RBAC, audit, kontrak FE, dan kualitas kode sebelum domain.

## Sudah selesai

- [x] Struktur `pages/<domain>` sebagai feature root.
- [x] Hapus folder `features/` dan halaman re-export.
- [x] Ziggy + whitelist `config/ziggy.php`.
- [x] Tipe route `resources/js/types/ziggy.d.ts`.
- [x] `AppLayout`, `PageHeader`, `EmptyState`, `DataTable`, `Can` dasar.
- [x] `usePermissions` dasar.
- [x] Import boundary check di `npm run check`.

## Backend

- [x] Install `spatie/laravel-permission` (teams OFF).
- [x] Tambah trait `HasRoles` ke `User`.
- [x] Buat enum permission per domain di `app/Enums/Permissions` (nama Inggris).
- [x] Buat `app/Support/PermissionRegistry.php`.
- [x] Buat `PermissionSeeder` idempotent.
- [x] Buat `RoleSeeder` dengan role baseline.
- [x] Daftarkan middleware alias `role`, `permission`, `role_or_permission`.
- [x] Tambah `Gate::before` untuk `super-admin`.
- [x] Share `auth.roles` dan `auth.permissions` di `HandleInertiaRequests`.
- [x] Buat tabel `units` dan pivot `user_unit`.
- [x] Buat Policy dasar (`UnitPolicy`, `PatientAccessLogPolicy`, `BreakGlassGrantPolicy`).
- [ ] Buat query scope unit di model domain (menyusul saat model kunjungan ada).
- [x] Install `spatie/laravel-activitylog` dan konfigurasi log RBAC.
- [x] Buat `patient_access_logs` dan pencatatan akses.
- [x] Buat tabel/model/policy `break_glass_grants`.
- [ ] Buat endpoint break-glass request/review.
- [x] Buat command `simrs:permissions --types`.
- [x] Tambah test permission matrix, unit access, audit, dan break-glass.

## Frontend

- [x] Generate `resources/js/types/permissions.d.ts` dari backend.
- [x] Upgrade `Can` agar mendukung `any` dan `all`.
- [ ] Pakai `usePoll` bawaan Inertia (`background: 'pause'`) di halaman kritis.
- [ ] Buat `useUnsavedChanges`.
- [ ] Buat `ConfirmDialog`, `FormField`, `Pagination`, `StatusBadge`.
- [x] Buat halaman `pages/errors/403.tsx`.
- [ ] Tambah modal break-glass di halaman 403.
- [x] Buat handler exception Inertia untuk 403.
- [x] Buat handler exception Inertia untuk 404/500.
- [ ] Install `react-i18next` + `i18next` dan setup bahasa Indonesia.
- [ ] Install Vitest dan test formatter/permission hook.
- [x] Tambah permission pada `shared/config/navigation.ts`.

## Bootstrap admin pertama

Belum ada UI/CLI pembuat user. Setelah user dibuat, beri role lewat tinker:

```
php artisan tinker --execute '$user = App\Models\User::first(); $user->assignRole(App\Enums\RoleName::SuperAdmin->value);'
```

## Verifikasi

```
php artisan test --compact
npm run types:check
npm run check
npm run build
vendor/bin/pint --format agent
```
