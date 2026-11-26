# PRD — Master Data

Status: IMPLEMENTED

## Tujuan

Menyediakan data referensi yang dipakai seluruh domain: pasien, dokter, unit
(poli/ruang/lab/radiologi/farmasi), produk (obat, alkes/BMHP, reagen, umum),
tarif/tindakan, dan penjamin.

## Aktor

- Admin
- Petugas pendaftaran (CRUD pasien, read-only referensi)
- Dokter/perawat/apoteker (read-only referensi sesuai izin)

## Scope

Termasuk:

- CRUD pasien dengan pencarian nomor rekam medis, NIK, nama, tanggal lahir.
- Deteksi dan merge pasien duplikat.
- CRUD dokter dan jadwal praktik dasar.
- CRUD unit kerja (poli, ruang rawat, lab, radiologi, farmasi).
- CRUD produk (obat, alkes, reagen, produk umum) beserta kategori dan tampilan detail bergaya Odoo (`ProductShow`).
- CRUD tarif/tindakan.
- CRUD penjamin (umum, asuransi, perusahaan).
- Tabel daftar Master Data bergaya kompak (`py-1`, `text-xs`) untuk keterbacaan padat.

Tidak termasuk:

- Integrasi penjamin eksternal dan klaim.
- Manajemen stok & mutasi gudang (ada di Inventaris).

## Alur utama

1. Admin mencari pasien berdasarkan NIK/nama/nomor rekam medis.
2. Sistem menampilkan kandidat duplikat sebelum create.
3. Admin/petugas membuat atau memperbarui data pasien.
4. Admin mengelola referensi dokter, unit, produk, tarif, dan penjamin.
5. Perubahan referensi tercatat di activity log.

## Entitas

- `patients`: nomor rekam medis, NIK, nama, jenis kelamin, tanggal lahir, alamat, telepon, status, `merged_to_patient_id`.
- `doctors`: kode, nama, spesialisasi, nomor izin, telepon, email, status.
- `doctor_schedules`: dokter, unit, hari, jam mulai/selesai, kuota.
- `units`: `code` unik, `name`, tipe (`outpatient`, `inpatient`, `emergency`, `laboratory`, `radiology`, `pharmacy`, `other`), `is_active`.
- `product_categories`: nama, deskripsi.
- `products`: kode, nama, `product_type` (`drug`, `medical_supply`, `reagent`, `general`), kategori, bentuk, kekuatan, satuan, harga, produsen, status.
- `tariffs`: kode, nama, kategori, unit terkait, harga, status.
- `guarantors`: kode, nama, tipe, keterangan, status.

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
master-data.product.view
master-data.product.manage
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

## Ketergantungan

- Fondasi RBAC + audit.
