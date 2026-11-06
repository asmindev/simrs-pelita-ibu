# PRD — Master Data

Status: IN PROGRESS — CRUD pasien, unit, dokter, dan jadwal praktik selesai;
obat, tarif, penjamin, dan merge menyusul.

## Tujuan

Menyediakan data referensi yang dipakai seluruh domain: pasien, dokter, unit
(poli/ruang/lab/radiologi/farmasi), obat, tarif/tindakan, dan penjamin.

## Aktor

- Admin
- Petugas pendaftaran (read-only pasien)
- Dokter/perawat (read-only referensi)

## Scope

Termasuk:

- CRUD pasien dengan pencarian nomor rekam medis, NIK, nama, tanggal lahir.
- Deteksi dan merge pasien duplikat.
- CRUD dokter dan jadwal praktik dasar.
- CRUD unit kerja (poli, ruang rawat, lab, radiologi, farmasi).
- CRUD obat (nama, bentuk, kekuatan, satuan, status aktif).
- CRUD tarif/tindakan.
- CRUD penjamin (umum, asuransi, perusahaan).

Tidak termasuk:

- Integrasi penjamin eksternal dan klaim.
- Manajemen stok obat (ada di Farmasi).

## Referensi legacy

- `admin/manage_department.php` → CRUD unit (nama, deskripsi).
- `admin/manage_doctor.php` → CRUD dokter + jadwal praktik.
- `admin/manage_patient.php` → CRUD pasien (sudah diimplementasikan).
- `pharmacist/manage_medicine_category.php` + `manage_medicine.php` →
  kategori dan obat (nama, kategori, harga, produsen, status).
- `admin/manage_admin/doctor/nurse/pharmacist/laboratorist/accountant.php` →
  user + role (dikerjakan bersama Fase 7).

Field legacy yang dipertahankan: deskripsi unit, profil dokter, harga/produsen
obat, status aktif, dan golongan darah pasien (ditambahkan saat blood bank
disetujui). Tidak diadopsi: akun pasien dengan password di tabel pasien dan
pengiriman password plaintext.

## Alur utama

1. Admin mencari pasien berdasarkan NIK/nama/nomor rekam medis.
2. Sistem menampilkan kandidat duplikat sebelum create.
3. Admin membuat atau memperbarui data pasien.
4. Admin mengelola referensi dokter, unit, obat, tarif, penjamin.
5. Perubahan referensi tercatat di audit.

## Entitas

- `patients`: nomor rekam medis, NIK, nama, jenis kelamin, tanggal lahir,
  alamat, telepon, penjamin default, golongan darah (opsional), status.
- `doctors`: kode, nama, spesialisasi, nomor izin, telepon, email, status;
  tautan user menyusul saat UI user tersedia.
- `doctor_schedules`: dokter, unit, hari, jam mulai/selesai, kuota.
- `units`: `code` unik, `name`, tipe (`outpatient`, `inpatient`, `emergency`,
  `laboratory`, `radiology`, `pharmacy`, `other`), `is_active`.
- `drug_categories`: nama, deskripsi.
- `drugs`: nama, kategori, bentuk, kekuatan, satuan, harga, produsen, status.
- `tariffs`: kode, nama, kategori, harga.
- `insurers`: nama, tipe, status.

## Permission

```
master-data.patient.view
master-data.patient.create
master-data.patient.update
master-data.patient.delete
master-data.patient.merge
master-data.doctor.view
master-data.doctor.manage
master-data.unit.view
master-data.unit.manage
master-data.drug.view
master-data.drug.manage
master-data.tariff.view
master-data.tariff.manage
master-data.guarantor.view
master-data.guarantor.manage
```

## Aturan

- Nomor rekam medis unik dan tidak berubah.
- NIK unik jika diisi.
- Jadwal dokter tidak boleh tumpang tindih pada hari yang sama.
- Delete pasien hanya jika belum punya kunjungan; selain itu nonaktifkan.
- Merge pasien wajib memilih data master dan tercatat di audit.

## Kriteria penerimaan

- Pencarian pasien menampilkan hasil dalam < 1 detik pada data uji.
- Duplikat terdeteksi sebelum create.
- Permission matrix diuji dengan Pest.
- Semua perubahan referensi masuk activity log.
- FE menyembunyikan aksi tanpa izin dan backend menolaknya.

## Ketergantungan

- Fondasi RBAC + audit.
- Unit kerja untuk scoping baris.
