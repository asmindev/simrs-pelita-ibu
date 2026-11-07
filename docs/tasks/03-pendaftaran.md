# Fase 3 — Pendaftaran

Status: selesai (kunjungan encounters, penomoran antrean queues unik per unit per hari, insurance coverages, policy unit scoping, pencegahan kunjungan ganda, dan queue board live dengan usePoll selesai).

## Referensi legacy

- `admin/view_appointment.php`, `doctor/manage_appointment.php`,
  `patient/view_appointment.php`: appointment datar (dokter, pasien, waktu).
- Petakan ke `encounters` + `queues`; tambahkan unit, jenis kunjungan,
  penjamin, status, dan nomor antrean.
- Jadwal praktik diambil dari Master Data dokter.

## Backend

- [x] Migration `encounters`, `queues`, `insurance_coverages`.
- [x] Dukung kunjungan terjadwal dari appointment legacy dan walk-in.
- [x] Model + relasi.
- [x] Controller kunjungan dan antrean.
- [x] FormRequest.
- [x] Policy scoping unit.
- [x] Pencegahan kunjungan ganda.
- [x] Penomoran antrean unik per unit per hari.
- [x] Permission enum Registration.
- [x] Test alur, jadwal vs walk-in, dan konkurensi.

## Frontend

- [x] `pages/registration/home/index.tsx`.
- [x] `pages/registration/visit/{list,create}/index.tsx`.
- [x] Tampilkan jadwal dokter dari Master Data di form kunjungan.
- [x] `QueueBoard` dan `EncounterForm` di components.
- [x] `usePoll` untuk antrean.
- [x] Filter dan pagination di URL.
- [x] Aksi panggil/batal dibungkus `Can`.

## Kriteria

- Pendaftaran tanpa reload penuh.
- Nomor antrean tidak duplikat saat bersamaan.
- Permission dan scoping unit diuji.
