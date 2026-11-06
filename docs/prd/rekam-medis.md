# PRD — Rekam Medis

Status: PLANNED

## Tujuan

Menyediakan rekam medis elektronik per kunjungan: asesmen, diagnosis, tindakan,
catatan, dan order penunjang, dengan kontrol akses ketat.

## Aktor

- Dokter
- Perawat
- Auditor (read-only + audit akses)
- Petugas rekam medis (read-only sesuai izin)

## Scope

Termasuk:

- Buka encounter dari pendaftaran.
- Asesmen awal dan lanjutan.
- Diagnosis (utama dan sekunder).
- Tindakan/prosedur.
- Catatan sensitif (psikiatri, HIV) dengan permission khusus.
- Order penunjang dan resep.
- Draft autosave untuk form panjang.
- Riwayat kunjungan pasien.
- Audit akses baca/tulis.

Tidak termasuk:

- Penulisan resep final (ada di Farmasi).
- Hasil penunjang (ada di Penunjang).

## Alur utama

1. Dokter/perawat membuka encounter dari antrean.
2. Sistem memeriksa Policy unit dan permission.
3. Pengguna mengisi asesmen; draft disimpan otomatis.
4. Diagnosis dan tindakan ditambahkan.
5. Order penunjang/resep dikirim ke domain terkait.
6. Encounter ditutup setelah selesai.
7. Setiap akses data pasien tercatat.

## Field sensitif

- Backend tidak mengirim field jika user tidak punya permission.
- Permission contoh:
    - `medical-record.sensitive-note.view`
    - `medical-record.sensitive-note.update`
- FE membungkus field dengan `<Can>`.
- Akses darurat memakai break-glass dengan alasan dan audit.

## Entitas

- `medical_records` / `encounters`
- `assessments`
- `diagnoses`
- `procedures`
- `sensitive_notes`
- `record_drafts`
- `patient_access_logs`

## Permission

```
medical-record.encounter.view
medical-record.encounter.create
medical-record.encounter.update
medical-record.assessment.update
medical-record.diagnosis.manage
medical-record.procedure.manage
medical-record.sensitive-note.view
medical-record.sensitive-note.update
medical-record.resume.export
```

## Aturan

- Draft autosave tidak boleh menimpa data final tanpa konfirmasi.
- Edit bersamaan memakai optimistic lock `updated_at`.
- Catatan yang sudah final tidak boleh dihapus; koreksi memakai addendum.
- Semua akses field sensitif tercatat.
- Perawat hanya encounter di ruang yang ditugaskan; dokter hanya poli terkait.

## Kriteria penerimaan

- Form panjang tidak kehilangan data saat navigasi tidak sengaja.
- Konflik edit terdeteksi dan diberi pesan.
- Field sensitif tidak ada di payload untuk user tanpa izin.
- Audit akses tercatat untuk setiap buka/simpan.
- Break-glass berfungsi dan dapat ditinjau auditor.

## Ketergantungan

- Pendaftaran.
- Fondasi RBAC, audit, dan break-glass.
