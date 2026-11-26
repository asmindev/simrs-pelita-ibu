# PRD — Pendaftaran

Status: IMPLEMENTED

## Tujuan

Mendaftarkan pasien menjadi kunjungan, memilih unit/dokter/penjamin,
menerbitkan nomor antrean, dan mengelola siklus pelayanan kunjungan dari satu
alur ringkas tanpa papan antrean terpisah.

## Aktor

- Petugas pendaftaran
- Dokter/perawat (read-only kunjungan di unitnya + akses ke EMR)
- Apoteker/dokter (melihat ringkasan E-Resep kunjungan bila berizin)

## Scope

Termasuk:

- Cari pasien lalu buat kunjungan baru (`registration/visits/create`).
- Pilih unit, dokter, jenis kunjungan (`outpatient` / `emergency`), dan penjamin.
- Terbitkan nomor antrean harian unik per unit.
- Kelola status antrean & kunjungan (`Panggil`, `Mulai Layani`, `Selesai Layani`, `Lewati`) langsung dari halaman **Detail Kunjungan** (`registration/visits/{id}`).
- Daftar Kunjungan (`registration/visits`) dengan tabel kompak dan klik baris langsung menuju Detail Kunjungan.
- Pintasan langsung **Buka EMR** dari Detail Kunjungan menuju Rekam Medis.
- Ringkasan & daftar **Resep Obat (E-Resep)** kunjungan serta **Tagihan Kasir** di dalam tab Detail Kunjungan.
- Batalkan kunjungan dengan alasan wajib.

Tidak termasuk:

- Display TV / papan antrean terpisah (`queue/board` telah dihapus untuk menyederhanakan flow).
- Penjadwalan operasi.
- Pendaftaran rawat inap (ada di Rawat Inap).

## Referensi legacy

- `admin/view_appointment.php`, `doctor/manage_appointment.php`, dan
  `patient/view_appointment.php`: appointment datar berisi dokter, pasien, dan
  waktu.
- Di SIMRS baru menjadi `encounters` + `queues`, dengan tambahan unit, jenis
  kunjungan, penjamin, status, dan nomor antrean.
- Jadwal praktik berasal dari Master Data dokter, bukan dari legacy.
- Kunjungan terjadwal dan walk-in memakai satu alur antrean yang sama.

## Alur utama

1. Petugas mencari pasien (atau mendaftarkan pasien baru di Master Data).
2. Petugas membuat kunjungan dan memilih unit/dokter/penjamin.
3. Sistem menerbitkan nomor antrean harian unik per unit dan draft invoice awal.
4. Pada daftar kunjungan (`/registration/visits`), petugas mengklik baris pasien untuk membuka halaman **Detail Kunjungan** (`/registration/visits/{id}`) yang memuat:
    - **Control Bar & Journey Stepper**: tombol aksi antrean (_Panggil_, _Mulai Layani_, _Selesai Layani_, _Lewati_), pintasan _Buka EMR_, _Batalkan_, dan stepper 3 tahap (_Terdaftar → Pelayanan → Selesai_).
    - **Patient Sheet Header & 4 Summary Tiles**: identitas pasien beserta 4 kartu ringkas interaktif (_Antrean_, _Penjamin_, _Resep Obat_, _Tagihan Kasir_).
    - **Tabs**: _Ringkasan_, _Resep Obat_ (untuk pengguna dengan `pharmacy.prescription.view`), dan _Tagihan & Kasir_.
5. Status kunjungan berubah menjadi `in_consultation` (_Sedang Dilayani_) saat staf menekan _Mulai Layani_ atau saat dokter/perawat mulai mengisi asesmen di EMR, dan selesai (`finished`) lewat _Selesai Layani_ atau _Selesai Konsultasi_ di EMR.

## Entitas

- `encounters`: pasien, unit, dokter, jenis, penjamin, status (`arrived`, `in_consultation`, `finished`, `cancelled`), waktu masuk/mulai/selesai.
- `queues`: unit, nomor, status (`waiting`, `calling`, `serving`, `completed`, `skipped`, `cancelled`), waktu dipanggil/dilayani/selesai.
- `insurance_coverages`: kunjungan, penjamin, nomor kartu/SEP.

## Permission

```
registration.visit.view
registration.visit.create
registration.visit.update
registration.visit.cancel
registration.queue.view
registration.queue.call
registration.guarantor.manage
```

## Aturan

- Satu pasien tidak boleh punya dua kunjungan aktif pada unit dan tanggal sama
  tanpa konfirmasi.
- Nomor antrean unik per unit per hari.
- Pembatalan wajib alasan dan tercatat di audit.
- Petugas hanya melihat kunjungan di unit yang ditugaskan (Policy).
- Pembuatan E-Resep hanya diizinkan saat status kunjungan `in_consultation` (_Sedang Dilayani_).

## Ketergantungan

- Master Data.
- Fondasi RBAC + audit.
- Rekam Medis & Farmasi (tautan EMR dan visibilitas E-Resep ter-assign).
