# PRD — RBAC & Audit

Status: PLANNED

## Tujuan

Menyediakan fondasi otorisasi dan audit: role, permission, penugasan unit,
break-glass, dan jejak akses data pasien.

## Aktor

- Admin
- Auditor
- Super-admin (terbatas)

## Scope v1

Termasuk:

- Instalasi `spatie/laravel-permission` dengan teams OFF.
- Registry permission per domain (enum + agregator).
- Seeder permission dan role idempotent.
- Middleware alias `role`, `permission`, `role_or_permission`.
- `Gate::before` untuk `super-admin`.
- Share `auth.roles` dan `auth.permissions` ke Inertia.
- Policy + scoping unit (`units`, `user_unit`).
- Break-glass backend + audit.
- Activity log perubahan role/permission.
- Audit akses data pasien.

Tidak termasuk di v1:

- UI matrix role x permission.
- UI CRUD permission.
- UI review break-glass.

UI tersebut masuk v1.1. Di v1, pengelolaan memakai seeder/CLI.

## Alur utama v1

1. Seeder membuat permission dari registry.
2. Seeder membuat role baseline dan memberi permission.
3. Admin memberi role ke user lewat CLI/seeder.
4. `HandleInertiaRequests` membagikan role dan permission.
5. Route/Policy menolak akses tanpa izin.
6. Perubahan role/permission tercatat di activity log.
7. Auditor meninjau log lewat query/CLI sampai UI tersedia.

## Referensi legacy

- `admin/manage_admin/doctor/nurse/pharmacist/laboratorist/accountant/patient.php`
  → user management + role (UI masuk Fase 7).
- Tabel `log` dan `view_log.php` legacy tidak pernah dipakai; diganti
  `activity_log` + `patient_access_logs`.
- Tidak diadopsi: sesi role per tabel, plaintext password, `login_as`, dan
  impersonation.
- Patient portal legacy masih pertanyaan terbuka; jika diadopsi, tambahkan
  role `patient` dan scope khusus.

## Entitas

- `roles`, `permissions`, `model_has_roles`, `role_has_permissions`
  (dari spatie)
- `units`, `user_unit`
- `break_glass_grants`
- `activity_log` (spatie activitylog)
- `patient_access_logs`

## Permission

```
rbac.user.view
rbac.user.manage
rbac.role.view
rbac.role.assign
rbac.permission.view
rbac.break-glass.request
rbac.break-glass.review
audit.log.view
audit.patient-access.view
```

## Aturan

- User tidak boleh punya direct permission.
- Hanya `super-admin` yang memakai bypass.
- Setiap perubahan role/permission wajib tercatat.
- Break-glass wajib alasan dan kedaluwarsa.
- Permission di-seed dari registry, bukan dibuat manual di DB.
- Setelah deploy seeder, reset cache permission spatie.

## Kriteria penerimaan

- Seeder idempotent (dijalankan dua kali tidak duplikat).
- Middleware dan Policy menolak akses tanpa izin.
- FE menerima role/permission yang benar.
- Break-glass tercatat dan bisa ditinjau.
- Activity log dan patient access log terisi.
- Test matrix role x permission lulus.

## Ketergantungan

- Tidak ada; ini fondasi untuk semua domain.
