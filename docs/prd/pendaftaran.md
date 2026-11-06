# PRD — Pendaftaran

Status: PLANNED

## Tujuan

Mendaftarkan pasien menjadi kunjungan, memilih unit/dokter/penjamin, dan
menerbitkan nomor antrean.

## Aktor

- Petugas pendaftaran
- Dokter/perawat (read-only kunjungan di unitnya)

## Scope

Termasuk:

- Cari pasien lalu buat kunjungan baru.
- Pilih unit, dokter, jenis kunjungan, dan penjamin.
- Terbitkan nomor antrean per unit.
- Ubah status kunjungan (menunggu, dipanggil, selesai, batal).
- Batalkan kunjungan dengan alasan.

Tidak termasuk:

- Penjadwalan operasi.
- Pendaftaran rawat inap (ada di Rawat Inap).

## Alur utama

1. Petugas mencari pasien.
2. Jika belum ada, arahkan ke Master Data.
3. Petugas membuat kunjungan dan memilih unit/dokter/penjamin.
4. Sistem menerbitkan nomor antrean.
5. Petugas memanggil antrean berikutnya.
6. Status kunjungan diperbarui sampai selesai.

## Entitas

- `encounters`: pasien, unit, dokter, jenis, penjamin, status, waktu.
- `queues`: unit, nomor, status, waktu dipanggil.
- `insurance_coverages`: kunjungan, penjamin, nomor kartu.

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

## Kriteria penerimaan

- Pendaftaran selesai dalam satu alur tanpa reload penuh.
- Nomor antrean tidak duplikat saat dua petugas mendaftar bersamaan.
- Antrean kritis memakai polling `usePoll`.
- Permission dan scoping unit diuji.

## Ketergantungan

- Master Data.
- Fondasi RBAC + audit.
