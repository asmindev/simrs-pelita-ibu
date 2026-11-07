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
- [x] Migration `guarantors` dan `tariffs`.
- [x] Migration `drug_categories` dan `drugs`.
- [x] Model + factory + cast pasien.
- [x] Model + factory unit.
- [x] Model + factory dokter.
- [x] Model + factory jadwal dokter.
- [x] Model + factory penjamin dan tarif.
- [x] Model + factory kategori/obat.
- [x] Controller pasien (index/create/store/edit/update/destroy).
- [x] CRUD unit (tabel `units` sudah ada).
- [x] CRUD dokter (profil).
- [x] CRUD jadwal praktik dokter (validasi tumpang tindih).
- [x] CRUD penjamin dan tarif/tindakan.
- [x] CRUD kategori + obat (harga, produsen, status).
- [x] FormRequest validasi pasien.
- [x] FormRequest penjamin dan tarif.
- [x] FormRequest kategori dan obat.
- [ ] Policy scoping unit untuk data yang terikat unit.
- [x] Deteksi duplikat pasien (NIK atau nama + tanggal lahir).
- [ ] Endpoint merge pasien.
- [ ] Field golongan darah pasien (ditunda sampai blood bank disetujui).
- [x] Permission enum Master Data.
- [x] Test CRUD pasien + permission + duplikat.
- [x] Test CRUD unit + permission + audit.
- [x] Test CRUD dokter + permission + audit.
- [x] Test CRUD jadwal dokter + permission + audit.
- [x] Test CRUD penjamin dan tarif + permission + audit.
- [x] Test CRUD obat.
- [ ] Test merge pasien.

## Frontend

- [x] `pages/master-data/home/index.tsx` sebagai landing.
- [x] `pages/master-data/patient/{list,create,edit}/index.tsx`.
- [x] `pages/master-data/unit/{list,create,edit}/index.tsx`.
- [x] `pages/master-data/doctor/{list,create,edit}/index.tsx`.
- [x] Jadwal praktik di halaman edit dokter.
- [x] `pages/master-data/guarantor/{list,create,edit}/index.tsx`.
- [x] `pages/master-data/tariff/{list,create,edit}/index.tsx`.
- [x] `pages/master-data/drug/{list,create,edit}/index.tsx`.
- [ ] `PatientPicker` di `pages/master-data/patient/components`.
- [x] `PatientFilters`, `PatientForm` di
      `pages/master-data/patient/components`.
- [x] `use-patient-duplicates` di `pages/master-data/patient/hooks`.
- [x] Tabel pasien dengan filter di URL.
- [x] Aksi create/update/delete dibungkus `Can`.
- [x] Format tanggal/uang memakai `shared/lib/format`.

## Kriteria

- Pencarian dan duplikat berfungsi.
- CRUD unit dan dokter berfungsi dan perubahan tercatat di activity log.
- Jadwal dokter menolak jam tumpang tindih dan unit nonaktif.
- Permission diuji; scoping unit menyusul saat data terikat unit ada.
- Audit perubahan referensi tercatat.
