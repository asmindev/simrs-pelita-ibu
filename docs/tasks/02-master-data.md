# Fase 2 — Master Data

Status: sebagian (pasien selesai; referensi lain menyusul).

## Backend

- [x] Migration `patients`.
- [ ] Migration `doctors`, `drugs`, `tariffs`, `insurers`.
- [x] Model + factory + cast pasien.
- [x] Controller pasien (index/create/store/edit/update/destroy).
- [x] FormRequest validasi pasien.
- [ ] Policy scoping unit untuk data yang terikat unit.
- [x] Deteksi duplikat pasien (NIK atau nama + tanggal lahir).
- [ ] Endpoint merge pasien.
- [x] Permission enum Master Data.
- [x] Test CRUD pasien + permission + duplikat.
- [ ] Test merge pasien.

## Frontend

- [x] `pages/master-data/index.tsx` sebagai landing.
- [x] `pages/master-data/patient/{index,create,edit}.tsx`.
- [ ] `PatientPicker` di `pages/master-data/components`.
- [x] `PatientFilters`, `PatientForm` di `pages/master-data/components`.
- [x] `use-patient-duplicates` di `pages/master-data/hooks`.
- [x] Tabel pasien dengan filter di URL.
- [x] Aksi create/update/delete dibungkus `Can`.
- [x] Format tanggal/uang memakai `shared/lib/format`.

## Kriteria

- Pencarian dan duplikat berfungsi.
- Permission diuji; scoping unit menyusul saat data terikat unit ada.
- Audit perubahan referensi tercatat.
