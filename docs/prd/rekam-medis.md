# PRD — Rekam Medis

Status: IMPLEMENTED

## Tujuan

Menyediakan rekam medis elektronik (EMR) per kunjungan: asesmen SOAP,
diagnosis ICD-10, tindakan ICD-9-CM, penulisan E-Resep, catatan sensitif,
laporan klinis khusus, serta penyelesaian konsultasi dengan kontrol akses
ketat dan audit trail.

## Aktor

- Dokter
- Perawat
- Auditor (read-only + audit akses)
- Petugas rekam medis (read-only sesuai izin)

## Scope

Termasuk:

- Buka encounter dari Pendaftaran (tombol _Buka EMR_) atau daftar Rekam Medis.
- Asesmen SOAP & tanda vital (otomatis mengubah status `arrived` → `in_consultation`).
- Finalisasi asesmen + addendum untuk koreksi pasca-final.
- Diagnosis ICD-10 (utama dan sekunder).
- Tindakan/prosedur medis (ICD-9-CM).
- Pembuatan **E-Resep** multi-obat langsung di tab **E-Resep** (aktif hanya saat kunjungan berstatus `in_consultation` / _Sedang Dilayani_, menampilkan stok tersedia FEFO dan peringatan stok).
- Tombol **Selesai Konsultasi** langsung dari bar konteks pasien EMR (`finished` + menutup antrean terkait).
- Catatan sensitif (psikiatri, HIV, dll.) dengan permission khusus dan break-glass.
- Laporan tindakan/operasi, kelahiran, dan kematian.
- Draft autosave untuk form panjang.
- Riwayat kunjungan pasien lengkap beserta daftar resep obat yang diterbitkan.
- Audit akses baca/tulis (`PatientAccessLog`).

Tidak termasuk:

- Telaah/verifikasi apoteker dan dispensing stok FEFO (ada di Farmasi).
- Hasil pemeriksaan laboratorium/radiologi (ada di Penunjang).

## Alur utama

1. Dokter/perawat membuka encounter dari daftar EMR atau Detail Kunjungan Pendaftaran.
2. Sistem memeriksa Policy unit dan permission serta mencatat `PatientAccessLog`.
3. Pengguna mengisi asesmen SOAP (otomatis mengubah `arrived` → `in_consultation`), diagnosis, dan tindakan.
4. Saat kunjungan berstatus `in_consultation`, dokter dapat menulis **E-Resep** di tab _E-Resep_ menuju antrean Farmasi (`submitted`).
5. Setelah pelayanan selesai, dokter/staf menekan **Selesai Konsultasi** di EMR (atau _Selesai Layani_ di Pendaftaran) untuk menutup kunjungan menjadi `finished`.
6. Seluruh riwayat kunjungan termasuk resep obat dapat ditinjau di halaman **Riwayat Pasien**.

## Field sensitif

- Backend tidak mengirim `sensitive_notes` jika user tidak punya `medical-record.sensitive-note.view` atau break-glass grant aktif.
- Backend juga tidak mengirim daftar obat (`drugs`) jika kunjungan tidak berstatus `in_consultation` atau user tidak memiliki `pharmacy.prescription.create`.
- FE membungkus field dan aksi dengan `<Can>`.

## Entitas

- `encounters`, `assessments`, `record_addenda`, `diagnoses`, `procedures`
- `sensitive_notes`, `clinical_reports`, `record_drafts`
- `prescriptions`, `prescription_items`
- `patient_access_logs`, `break_glass_grants`

## Permission

```
medical-record.encounter.view
medical-record.encounter.create
medical-record.encounter.update
medical-record.assessment.update
medical-record.diagnosis.manage
medical-record.procedure.manage
medical-record.report.view
medical-record.report.manage
medical-record.sensitive-note.view
medical-record.sensitive-note.update
medical-record.resume.export
pharmacy.prescription.create   # untuk menulis e-resep di EMR
pharmacy.prescription.view     # untuk melihat riwayat e-resep di EMR & riwayat pasien
```

## Aturan

- Draft autosave tidak boleh menimpa data final tanpa konfirmasi.
- Edit bersamaan memakai optimistic lock `updated_at`.
- Catatan yang sudah final tidak boleh dihapus; koreksi memakai addendum.
- E-Resep baru hanya boleh dibuat ketika status kunjungan `in_consultation`.
- Semua akses dan aksi penulisan tercatat di `patient_access_logs` dan activity log.

## Ketergantungan

- Pendaftaran, Farmasi (E-Resep), dan Master Data.
- Fondasi RBAC, audit, dan break-glass.
