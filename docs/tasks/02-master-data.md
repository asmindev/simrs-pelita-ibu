# Fase 2 — Master Data

Status: sebagian (pasien, unit, dokter, dan jadwal selesai; obat, tarif,
penjamin, dan merge menyusul).

## Referensi legacy

- Unit: `admin/manage_department.php`.
- Dokter: `admin/manage_doctor.php`.
- Obat: `pharmacist/manage_medicine_category.php` + `manage_medicine.php`.
- Pasien: `admin/manage_patient.php` (selesai).
- User/staff: `admin/manage_*.php` (dikerjakan bersama Fase 7).

## Backend

- [x] Migration `patients`.
- [x] Migration deskripsi `units`.
- [x] Migration `doctors`.
- [x] Migration `doctor_schedules`.
- [ ] Migration `drug_categories`, `drugs`, `tariffs`, `insurers`.
- [x] Model + factory + cast pasien.
- [x] Model + factory unit.
- [x] Model + factory dokter.
- [x] Model + factory jadwal dokter.
- [ ] Model + factory kategori/obat, tarif, penjamin.
- [x] Controller pasien (index/create/store/edit/update/destroy).
- [x] CRUD unit (tabel `units` sudah ada).
- [x] CRUD dokter (profil).
- [x] CRUD jadwal praktik dokter (validasi tumpang tindih).
- [ ] CRUD kategori + obat (harga, produsen, status).
- [ ] CRUD tarif/tindakan dan penjamin.
- [x] FormRequest validasi pasien.
- [ ] FormRequest referensi lain.
- [ ] Policy scoping unit untuk data yang terikat unit.
- [x] Deteksi duplikat pasien (NIK atau nama + tanggal lahir).
- [ ] Endpoint merge pasien.
- [ ] Field golongan darah pasien (ditunda sampai blood bank disetujui).
- [x] Permission enum Master Data.
- [x] Test CRUD pasien + permission + duplikat.
- [x] Test CRUD unit + permission + audit.
- [x] Test CRUD dokter + permission + audit.
- [x] Test CRUD jadwal dokter + permission + audit.
- [ ] Test CRUD referensi lain.
- [ ] Test merge pasien.

## Frontend

- [x] `pages/master-data/index.tsx` sebagai landing.
- [x] `pages/master-data/patient/{index,create,edit}.tsx`.
- [x] `pages/master-data/unit/{index,create,edit}.tsx`.
- [x] `pages/master-data/doctor/{index,create,edit}.tsx`.
- [x] Jadwal praktik di halaman edit dokter.
- [ ] `pages/master-data/drug/{index,create,edit}.tsx`.
- [ ] `pages/master-data/tariff/{index,create,edit}.tsx`.
- [ ] `pages/master-data/insurer/{index,create,edit}.tsx`.
- [ ] `PatientPicker` di `pages/master-data/components`.
- [x] `PatientFilters`, `PatientForm` di `pages/master-data/components`.
- [x] `use-patient-duplicates` di `pages/master-data/hooks`.
- [x] Tabel pasien dengan filter di URL.
- [x] Aksi create/update/delete dibungkus `Can`.
- [x] Format tanggal/uang memakai `shared/lib/format`.

## Kriteria

- Pencarian dan duplikat berfungsi.
- CRUD unit dan dokter berfungsi dan perubahan tercatat di activity log.
- Jadwal dokter menolak jam tumpang tindih dan unit nonaktif.
- Permission diuji; scoping unit menyusul saat data terikat unit ada.
- Audit perubahan referensi tercatat.
