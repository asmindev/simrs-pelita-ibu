# Fase 7 — UI RBAC & Audit

Fase ini setelah domain inti stabil. Backend RBAC/audit sudah berjalan sejak
Fase 1.

## Backend

- [ ] CRUD role (tanpa permission langsung ke user).
- [ ] Assign/revoke role ke user.
- [ ] Endpoint review break-glass.
- [ ] Query audit log dan patient access log.
- [ ] Permission enum RBAC/Audit.

## Frontend

- [ ] `pages/rbac/user/{index,show}.tsx`.
- [ ] `pages/rbac/role/index.tsx` dengan matrix role x permission.
- [ ] `pages/rbac/break-glass/index.tsx` untuk review.
- [ ] `pages/audit/log/index.tsx`.
- [ ] `pages/audit/patient-access/index.tsx`.
- [ ] Semua aksi dibungkus `Can` dan dikonfirmasi `ConfirmDialog`.

## Kriteria

- Matrix hanya menampilkan permission dari registry.
- Perubahan role/permission masuk activity log.
- Break-glass dapat ditinjau dan ditutup.
- Audit log dapat difilter di URL.
