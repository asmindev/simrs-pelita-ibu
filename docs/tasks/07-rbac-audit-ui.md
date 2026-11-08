# Fase 7 — UI RBAC & Audit

Fase ini setelah domain inti stabil. Backend RBAC/audit sudah berjalan sejak
Fase 1.

## Referensi legacy

- `admin/manage_admin/doctor/nurse/pharmacist/laboratorist/accountant/patient.php`
  → user management + role.
- `view_log.php`/tabel `log` tidak dipakai; ganti dengan `activity_log` dan
  `patient_access_logs`.
- Tidak memakai sesi role per tabel, plaintext password, atau `login_as`.
- Patient portal menunggu keputusan; jika diadopsi tambahkan role `patient`.

## Backend

- [x] CRUD user/staff dari layar `manage_*` legacy.
- [x] CRUD role (tanpa permission langsung ke user).
- [x] Assign/revoke role ke user.
- [x] Endpoint review break-glass.
- [x] Query audit log dan patient access log.
- [x] Permission enum RBAC/Audit.

## Frontend

- [x] `pages/rbac/user/list/index.tsx` dengan dialog form profil dan assign role/unit.
- [x] `pages/rbac/role/list/index.tsx` dengan matrix role x permission.
- [x] `pages/rbac/break-glass/list/index.tsx` untuk review dan pencabutan akses darurat.
- [x] `pages/audit/log/list/index.tsx` dengan dialog detail snapshot payload.
- [x] `pages/audit/patient-access/list/index.tsx` dengan filter aksi dan tanggal.
- [x] Semua aksi terproteksi policy dan otorisasi permission.

## Kriteria

- Matrix hanya menampilkan permission dari registry.
- Perubahan role/permission masuk activity log.
- Break-glass dapat ditinjau dan ditutup.
- Audit log dapat difilter di URL.
