# PRD — Peta Domain

Dokumen ini memetakan domain rilis pertama. Setiap domain punya file PRD
sendiri. Status mengikuti file masing-masing.

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

## Referensi legacy (`~/Projects/simrs2`)

Rewrite memakai simrs2 sebagai referensi layar dan alur, bukan kode. Pemetaan:

| Legacy                                    | SIMRS baru                      | Catatan                          |
| ----------------------------------------- | ------------------------------- | -------------------------------- |
| `manage_department`                       | Master Data → Unit              | departemen menjadi unit          |
| `manage_doctor`                           | Master Data → Dokter + jadwal   | tambah jadwal/slot               |
| `manage_patient`                          | Master Data → Pasien            | sudah diimplementasikan          |
| `view_appointment` / `manage_appointment` | Pendaftaran → encounter + queue | legacy hanya appointment datar   |
| `manage_prescription`                     | Rekam Medis + Farmasi           | resep terstruktur + verifikasi   |
| `manage_bed` / `manage_bed_allotment`     | Rawat Inap                      | bed, admission, discharge        |
| `manage_medicine` + kategori              | Master Data → Obat              | stok/batch baru di Farmasi       |
| `manage_invoice` / `take_cash_payment`    | Kasir                           | invoice item + pembayaran        |
| `manage_report`                           | Rekam Medis → Laporan           | operasi/lahir/mati               |
| `manage_prescription` lab + upload        | Penunjang                       | order + hasil + file tervalidasi |
| `blood_bank` / `blood_donor`              | Backlog opsional                | belum masuk PRD inti             |
| `noticeboard` / `settings`                | Backlog opsional                | pelengkap admin                  |

Tidak diadopsi: autentikasi per tabel role, plaintext password, `login_as`,
backup/restore SQL, output/upload tanpa validasi, EMR free-text, invoice satu
baris, dan tabel `log` yang tidak dipakai.

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
- Apakah pasien punya portal/login sendiri (legacy memilikinya)?
- Apakah blood bank dan noticeboard masuk rilis pertama?
