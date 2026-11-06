# Aturan Penulisan

## Bahasa

- Teks UI: Bahasa Indonesia.
- Identifier kode (variabel, fungsi, tipe, route, permission): Bahasa Inggris.
- Dokumen dan komentar penjelas: Bahasa Indonesia.
- Format tanggal dan uang: `Asia/Jakarta` dan `id-ID`, terpusat di
  `shared/lib/format.ts`.

## Frontend

### Nama file

- Folder dan file: `lowercase-kebab` (`page-header.tsx`, `use-permissions.ts`).
- Export komponen: `PascalCase` (`PageHeader`).
- Export hook: `useX` (`usePermissions`).
- Halaman Inertia: `lowercase-kebab`, harus identik dengan `Inertia::render`.

### TypeScript

- Tidak memakai `any`; gunakan tipe eksplisit atau `unknown` + narrowing.
- Import lintas folder memakai alias `@/`.
- Tipe kontrak lintas domain di `shared/types`.
- Tipe permission dan role di-generate dari backend, bukan ditulis manual.

### Komponen dan hook

- Ekstrak hook/komponen sejak awal untuk setiap fitur (keputusan proyek).
- Hook mengembalikan state/perilaku, bukan JSX.
- Komponen yang mengembalikan JSX adalah komponen, bukan hook.
- Primitive shadcn dipakai langsung dari `@/shared/ui`; jangan membungkus ulang
  tanpa alasan.
- Komponen spesifik domain tetap di `pages/<domain>/components`; kode generik
  dipindahkan ke `shared/` sejak awal.
- Halaman adalah implementasi langsung di `pages/<domain>/index.tsx` (atau
  `pages/<domain>/<resource>/<action>.tsx`), bukan re-export.
- Domain tidak boleh mengimpor domain lain. Batas ini diperiksa oleh
  `scripts/check-import-boundaries.mjs` lewat `npm run check`.
- `DataTable` memakai API props-only: `columns`, `rows`, `rowKey`, `empty`.

### State dan data

- Server state berasal dari props Inertia. Jangan menyalinnya ke store global.
- State UI global (sidebar, konteks pasien aktif) memakai React Context di
  `shared`.
- Filter, sort, page, dan search tabel disimpan di query string URL.
- Jangan menyimpan data pasien di `localStorage`/`sessionStorage`.

### Form

- Gunakan `useForm` Inertia langsung, tanpa wrapper generik.
- Validasi utama di FormRequest backend. FE hanya memakai constraint HTML.
- Form panjang (rekam medis/asesmen) memakai draft autosave ke backend.
- Form lain memakai guard perubahan belum disimpan.
- Create/edit entitas kompleks memakai halaman penuh; dialog hanya untuk aksi
  ringan.

### Izin

- Gunakan `usePermissions()` untuk logika dan `<Can>` untuk JSX.
- Aksi tanpa izin disembunyikan, bukan hanya di-disable.
- Backend adalah penentu akhir; guard FE hanya UX.
- Field sensitif tidak dikirim backend jika tidak berhak, dan tetap dibungkus
  `Can` di FE.

### Route

- Jangan menulis URL hardcoded. Gunakan `route('nama.route')`.
- Setelah menambah/mengubah route backend, jalankan:

```
php artisan ziggy:generate resources/js/types/ziggy --types-only
```

### Verifikasi

```
npm run types:check
npm run check
npm run build
```

## Backend

- Ikuti gaya Laravel yang ada dan format dengan Pint.
- Gunakan FormRequest untuk validasi.
- Gunakan Policy untuk otorisasi baris; permission untuk aksi.
- Jangan memberi permission langsung ke user; hanya lewat role.
- Nama permission: `domain.resource.action` (contoh `master-data.patient.view`).
- Permission didaftarkan di enum per domain dan di-seed idempotent.
- Super-admin memakai `Gate::before`; role lain tidak.
- Jangan mengubah dependency tanpa persetujuan.

## Git

- Commit kecil dan fokus.
- Format pesan: `type(scope): ringkasan` (contoh `feat(pendaftaran): tambah form kunjungan`).
- Type yang dipakai: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- Jangan commit `.env`, kredensial, atau data pasien.

## Dokumen

- PRD per domain di `docs/prd`.
- Task per fase di `docs/tasks`.
- Tandai keputusan dengan status LOCKED / PLANNED / OPEN.
- Perbarui dokumen saat keputusan berubah.
