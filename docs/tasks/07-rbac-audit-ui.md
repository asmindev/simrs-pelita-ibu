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

- [ ] CRUD user/staff dari layar `manage_*` legacy.
- [ ] CRUD role (tanpa permission langsung ke user).
- [ ] Assign/revoke role ke user.
- [ ] Endpoint review break-glass.
- [ ] Query audit log dan patient access log.
- [ ] Permission enum RBAC/Audit.

## Frontend

- [ ] `pages/rbac/user/{list,show}/index.tsx`.
- [ ] `pages/rbac/role/list/index.tsx` dengan matrix role x permission.
- [ ] `pages/rbac/break-glass/list/index.tsx` untuk review.
- [ ] `pages/audit/log/list/index.tsx`.
- [ ] `pages/audit/patient-access/list/index.tsx`.
- [ ] Semua aksi dibungkus `Can` dan dikonfirmasi `ConfirmDialog`.

## Kriteria

- Matrix hanya menampilkan permission dari registry.
- Perubahan role/permission masuk activity log.
- Break-glass dapat ditinjau dan ditutup.
- Audit log dapat difilter di URL.
