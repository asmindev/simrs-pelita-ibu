# PRD — Rawat Inap

Status: PLANNED

## Tujuan

Mengelola admisi, penempatan bed, transfer, catatan harian, dan pemulangan
pasien rawat inap.

## Aktor

- Perawat
- Dokter
- Petugas pendaftaran (admisi)
- Kasir (pulang)

## Scope

Termasuk:

- Admisi dari kunjungan atau langsung.
- Penempatan bed dan riwayat perpindahan.
- Transfer antar ruang/bed.
- Catatan harian perawatan.
- Pemulangan dan ringkasan pulang.
- Status ketersediaan bed.

Tidak termasuk:

- Manajemen operasi.
- Penjadwalan jaga dokter.

## Referensi legacy

- `nurse/manage_bed.php`: nomor/tipe/status bed.
- `nurse/manage_bed_allotment.php` dan `doctor/manage_bed_allotment.php`: bed,
  pasien, waktu masuk, dan waktu keluar.
- Diperluas menjadi `admissions`, `bed_assignments`, `transfers`,
  `daily_notes`, dan `discharges`; legacy tidak punya transfer atau ringkasan
  pulang terstruktur.

## Alur utama

1. Pasien diadmisi ke ruang rawat.
2. Perawat menempatkan pasien di bed.
3. Dokter/perawat mengisi catatan harian.
4. Transfer dicatat jika pindah ruang/bed.
5. Pasien dipulangkan dengan ringkasan.
6. Kasir menyelesaikan tagihan.

## Entitas

- `admissions`
- `beds`
- `bed_assignments`
- `transfers`
- `daily_notes`
- `discharges`

## Permission

```
inpatient.admission.view
inpatient.admission.create
inpatient.bed.view
inpatient.bed.assign
inpatient.transfer.create
inpatient.daily-note.update
inpatient.discharge.create
```

## Aturan

- Satu bed hanya untuk satu pasien aktif.
- Transfer wajib alasan dan tercatat.
- Perawat hanya melihat ruang yang ditugaskan (Policy).
- Pemulangan hanya setelah ringkasan pulang diisi.
- Ketersediaan bed memakai polling di halaman kritis.

## Kriteria penerimaan

- Tidak ada bentrok bed saat dua perawat assign bersamaan.
- Riwayat perpindahan lengkap.
- Audit mencatat transfer dan pemulangan.
- Permission matrix diuji.

## Ketergantungan

- Pendaftaran dan Rekam Medis.
- Fondasi RBAC + audit.
