# Fase 2 — Master Data

Status: selesai (pasien, unit, dokter, jadwal, penjamin, tarif, produk, dan merge pasien selesai, termasuk tabel daftar Master Data bergaya kompak).

## Backend

- [x] Migration `patients`, `units`, `doctors`, `doctor_schedules`, `guarantors`, `tariffs`, `product_categories`, `products`.
- [x] Model + factory + cast untuk seluruh entitas Master Data.
- [x] Controller CRUD pasien, unit, dokter + jadwal praktik, penjamin, tarif, kategori & produk.
- [x] Deteksi duplikat pasien dan endpoint merge pasien.
- [x] Permission enum Master Data (`master-data.*`) & activity log.
- [x] Feature tests CRUD, permission matrix, duplikat, merge, dan jadwal praktik.

## Frontend

- [x] `pages/master-data/home/index.tsx` sebagai landing.
- [x] `pages/master-data/patient/{list,create,edit}/index.tsx` (`patient-columns.tsx`, `PatientFormDialog`, `PatientMergeDialog`).
- [x] `pages/master-data/unit/{list,create,edit}/index.tsx` (`unit-columns.tsx`, `UnitFormDialog`).
- [x] `pages/master-data/doctor/{list,create,edit}/index.tsx` (`doctor-columns.tsx`, `DoctorFormDialog`, `DoctorScheduleManager`).
- [x] `pages/master-data/guarantor/{list,create,edit}/index.tsx` (`guarantor-columns.tsx`).
- [x] `pages/master-data/tariff/{list,create,edit}/index.tsx` (`tariff-columns.tsx`).
- [x] `pages/master-data/product/{list,create,show,edit}/index.tsx` (halaman `ProductShow` bergaya Odoo dengan inline edit, tab stok/batch/mutasi/valuasi).
- [x] Tabel daftar Master Data memakai padding rapat (`py-1`, `text-xs`) dan kolom terpisah sesuai konvensi.

## Kriteria

- Pencarian, deteksi duplikat, dan merge berfungsi.
- CRUD seluruh entitas Master Data teruji dan masuk audit log.
- Permission matrix menyembunyikan aksi tanpa izin dan menolaknya di backend.
