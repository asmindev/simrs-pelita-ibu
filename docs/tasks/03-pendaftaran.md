# Fase 3 — Pendaftaran

Status: selesai (kunjungan `encounters`, penomoran antrean `queues` unik per unit per hari, `insurance_coverages`, policy unit scoping, pencegahan kunjungan ganda, serta penyederhanaan flow tanpa `queue/board` dengan redesign halaman Detail Kunjungan selesai).

## Referensi legacy

- `admin/view_appointment.php`, `doctor/manage_appointment.php`,
  `patient/view_appointment.php`: appointment datar (dokter, pasien, waktu).
- Petakan ke `encounters` + `queues`; tambahkan unit, jenis kunjungan,
  penjamin, status, dan nomor antrean.
- Jadwal praktik diambil dari Master Data dokter.

## Backend

- [x] Migration `encounters`, `queues`, `insurance_coverages`.
- [x] Dukung kunjungan terjadwal dan walk-in dalam satu alur antrean.
- [x] Model + relasi (`Encounter`, `Queue`, `InsuranceCoverage`).
- [x] Controller kunjungan (`EncounterController`, `RegistrationController`) dan endpoint aksi antrean (`QueueController`: `call`, `serve`, `complete`, `skip`, `data`).
- [x] Eager-loading `prescriptions.items.product` pada `EncounterController::show` hanya jika user memiliki `pharmacy.prescription.view`.
- [x] FormRequest & Policy scoping unit.
- [x] Pencegahan kunjungan ganda dan penomoran antrean unik per unit per hari.
- [x] Permission enum Registration.
- [x] Test alur kunjungan, siklus antrean, scoping unit, dan visibilitas resep.

## Frontend

- [x] `pages/registration/home/index.tsx` (ringkasan unit mengarah langsung ke daftar kunjungan terfilter `unit_id`).
- [x] `pages/registration/visit/list/index.tsx`: tabel kompak (`py-1.5`), tanpa kolom RM ganda dan tanpa kolom action, klik baris langsung ke Detail Kunjungan (`onRowClick`).
- [x] `pages/registration/visit/create/index.tsx` (`EncounterForm` + `SelectedPatientCard`).
- [x] `pages/registration/visit/show/index.tsx`: redesign sheet detail kunjungan berbasis Tabs & UX Pro Max (`VisitControlBar` + journey stepper, `VisitSheetHeader` + 4 summary tiles, `VisitOverviewTab`, `VisitPrescriptionsTab`, `VisitBillingTab`, `CancelVisitDialog`).
- [x] Menghapus halaman `Papan Antrean` (`queue/board`) dan memindahkan aksi antrean langsung ke Detail Kunjungan + tautan _Buka EMR_.
- [x] Filter dan pagination di URL; aksi dibungkus `Can`.

## Kriteria

- Pendaftaran dan transisi status kunjungan berjalan tanpa reload penuh.
- Nomor antrean tidak duplikat saat bersamaan.
- Permission, scoping unit, dan omisi resep tanpa izin teruji.
