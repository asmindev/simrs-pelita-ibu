# Tasks — Roadmap

Status: semua fase **PLANNED** kecuali item yang ditandai selesai.
Satu fase harus selesai dan terverifikasi sebelum fase berikutnya dimulai.

| Fase | File                                                       | Fokus                             | Status   |
| ---- | ---------------------------------------------------------- | --------------------------------- | -------- |
| 1    | [01-foundation.md](./01-foundation.md)                     | Fondasi RBAC, audit, FE shell     | Sebagian |
| 2    | [02-master-data.md](./02-master-data.md)                   | Pasien, dokter, unit, obat, tarif | Selesai  |
| 3    | [03-pendaftaran.md](./03-pendaftaran.md)                   | Kunjungan dan antrean             | Selesai  |
| 4    | [04-rekam-medis.md](./04-rekam-medis.md)                   | EMR, draft, field sensitif        | Selesai  |
| 5    | [05-farmasi-kasir.md](./05-farmasi-kasir.md)               | Resep, stok, invoice, pembayaran  | Selesai  |
| 6    | [06-penunjang-rawat-inap.md](./06-penunjang-rawat-inap.md) | Lab/radiologi, admisi, bed        | Belum    |
| 7    | [07-rbac-audit-ui.md](./07-rbac-audit-ui.md)               | UI RBAC dan audit                 | Belum    |

## Legacy parity

Pemetaan layar `simrs2` ada di `docs/prd/README.md`. Item porting dicatat di
fase terkait; jangan menyalin kode legacy. Backlog opsional yang belum masuk
fase inti: blood bank/donor, noticeboard, settings, dan patient portal.

## Definition of done per fase

- Permission matrix diuji.
- Policy/scoping diuji.
- Audit tercatat untuk aksi sensitif.
- FE menyembunyikan aksi tanpa izin.
- `npm run check`, `npm run build`, dan `vendor/bin/pint --format agent` lulus.
- Dokumen PRD terkait diperbarui jika keputusan berubah.
