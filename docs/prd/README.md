# PRD — Peta Domain

Dokumen ini memetakan domain rilis pertama. Setiap domain punya file PRD
sendiri. Status awal semua domain: **PLANNED**.

## Aktor

- Petugas pendaftaran
- Dokter
- Perawat
- Apoteker
- Kasir
- Analis laboratorium
- Radiografer
- Admin
- Manajemen
- Auditor

## Domain dan prioritas

| Urutan | Domain               | File                                   | Ketergantungan                  |
| ------ | -------------------- | -------------------------------------- | ------------------------------- |
| 0      | Fondasi RBAC + audit | [rbac-audit.md](./rbac-audit.md)       | —                               |
| 1      | Master Data          | [master-data.md](./master-data.md)     | Fondasi                         |
| 2      | Pendaftaran          | [pendaftaran.md](./pendaftaran.md)     | Master Data                     |
| 3      | Rekam Medis          | [rekam-medis.md](./rekam-medis.md)     | Pendaftaran                     |
| 4      | Farmasi              | [farmasi.md](./farmasi.md)             | Rekam Medis, Master Data        |
| 5      | Kasir/Billing        | [kasir-billing.md](./kasir-billing.md) | Pendaftaran, Farmasi, Penunjang |
| 6      | Penunjang            | [penunjang.md](./penunjang.md)         | Rekam Medis                     |
| 7      | Rawat Inap           | [rawat-inap.md](./rawat-inap.md)       | Pendaftaran, Rekam Medis        |

RBAC/Audit berada di urutan 0 untuk fondasi backend (spatie, registry
permission, share props). UI matrix RBAC masuk v1.1.

## Kebutuhan lintas domain

- Otorisasi memakai permission `domain.resource.action`.
- Scoping baris memakai Policy + unit kerja user.
- Semua aksi sensitif tercatat di audit.
- Tidak ada data pasien di storage browser.
- Tabel memakai pagination server-side dan filter di URL.
- Create/edit kompleks memakai halaman penuh.
- Cetak resep/invoice/hasil memakai PDF backend.
- Field sensitif di-omit di server jika tidak berhak.

## Asumsi

- Satu fasilitas, satu zona waktu `Asia/Jakarta`, mata uang IDR.
- Registrasi user tidak terbuka; user dibuat admin.
- Integrasi BPJS/SATUSEHAT belum termasuk rilis pertama.
- Belum ada aplikasi mobile/API terpisah.

## Pertanyaan terbuka

- Format nomor rekam medis dan nomor kunjungan.
- Aturan merge pasien duplikat.
- Kebutuhan integrasi alat laboratorium.
- Kebijakan retensi rekam medis.
