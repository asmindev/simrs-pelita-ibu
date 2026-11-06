# Fase 3 — Pendaftaran

## Referensi legacy

- `admin/view_appointment.php`, `doctor/manage_appointment.php`,
  `patient/view_appointment.php`: appointment datar (dokter, pasien, waktu).
- Petakan ke `encounters` + `queues`; tambahkan unit, jenis kunjungan,
  penjamin, status, dan nomor antrean.
- Jadwal praktik diambil dari Master Data dokter.

## Backend

- [ ] Migration `encounters`, `queues`, `insurance_coverages`.
- [ ] Dukung kunjungan terjadwal dari appointment legacy dan walk-in.
- [ ] Model + relasi.
- [ ] Controller kunjungan dan antrean.
- [ ] FormRequest.
- [ ] Policy scoping unit.
- [ ] Pencegahan kunjungan ganda.
- [ ] Penomoran antrean unik per unit per hari.
- [ ] Permission enum Registration.
- [ ] Test alur, jadwal vs walk-in, dan konkurensi.

## Frontend

- [ ] `pages/registration/home/index.tsx`.
- [ ] `pages/registration/visit/{list,create}/index.tsx`.
- [ ] Tampilkan jadwal dokter dari Master Data di form kunjungan.
- [ ] `QueueBoard` dan `EncounterForm` di components.
- [ ] `usePoll` untuk antrean.
- [ ] Filter dan pagination di URL.
- [ ] Aksi panggil/batal dibungkus `Can`.

## Kriteria

- Pendaftaran tanpa reload penuh.
- Nomor antrean tidak duplikat saat bersamaan.
- Permission dan scoping unit diuji.
