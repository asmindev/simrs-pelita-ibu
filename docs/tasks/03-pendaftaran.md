# Fase 3 — Pendaftaran

## Backend

- [ ] Migration `encounters`, `queues`, `insurance_coverages`.
- [ ] Model + relasi.
- [ ] Controller kunjungan dan antrean.
- [ ] FormRequest.
- [ ] Policy scoping unit.
- [ ] Pencegahan kunjungan ganda.
- [ ] Penomoran antrean unik per unit per hari.
- [ ] Permission enum Registration.
- [ ] Test alur dan konkurensi.

## Frontend

- [ ] `pages/registration/index.tsx`.
- [ ] `pages/registration/visit/{index,create}.tsx`.
- [ ] `QueueBoard` dan `EncounterForm` di components.
- [ ] `usePoll` untuk antrean.
- [ ] Filter dan pagination di URL.
- [ ] Aksi panggil/batal dibungkus `Can`.

## Kriteria

- Pendaftaran tanpa reload penuh.
- Nomor antrean tidak duplikat saat bersamaan.
- Permission dan scoping unit diuji.
