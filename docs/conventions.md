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
- Tipe mengikuti tingkat pemakaian: route, resource, domain, lalu
  `shared/types` untuk kontrak lintas domain.
- Tipe permission dan role di-generate dari backend, bukan ditulis manual.

### Struktur halaman dan pendukung

- Setiap halaman Inertia adalah folder dengan `index.tsx`. Nama komponen di
  `Inertia::render` adalah path folder ditambah `/index`, misalnya
  `Inertia::render('master-data/patient/list/index')`.
- **Halaman `index.tsx` wajib tipis (thin view composer / orchestrator)**:
    - Tidak boleh ada logic bisnis, kalkulasi data, format kompleks, atau inline badge helper di `index.tsx`.
    - **Cakupan folder (scope) wajib tepat**:
        - Jika komponen/hook/filter/kolom **hanya dipakai di 1 route** (misalnya halaman `list`), **wajib disimpan di dalam folder route tersebut**: `<action>/components/` (contoh: `list/components/<resource>-columns.tsx`, `list/components/<resource>-statistics.tsx`, `list/components/<resource>-filters.tsx`) dan `<action>/hooks/`. Dilarang menumpuk komponen route-specific di level resource!
        - Komponen yang **dipakai bersama oleh 2+ route** dalam satu resource (misal dipakai di `list` DAN `show`) disimpan di `<resource>/components/`.
        - Modal dialog aksi disimpan di `<action>/components/` jika spesifik route, atau `<resource>/components/` jika dipakai lintas route.
    - State interaksi/aksi dipisah ke custom hook di `hooks/` sesuai tingkat pemakaiannya.
- Halaman daftar memakai folder `list`; landing domain memakai `home`;
  create/edit memakai `create`/`edit`.
- Folder pendukung dibuat saat dibutuhkan, bukan folder kosong:
    - route: `pages/<domain>/<resource>/<action>/{components,hooks,types,lib}`
      untuk kode yang hanya dipakai route itu;
    - resource: `pages/<domain>/<resource>/{components,hooks,types,lib}` untuk
      kode yang dipakai beberapa route dalam resource yang sama;
    - domain: `pages/<domain>/{components,hooks,types,lib}` untuk kode yang
      dipakai beberapa resource dalam domain yang sama;
    - `shared/` untuk kode yang dipakai 2+ domain.
- Tidak ada `utils/` atau `helpers/`. Fungsi murni masuk `lib`; state/perilaku
  masuk `hooks`.
- Halaman adalah implementasi langsung, bukan re-export.
- Route folder tidak boleh mengimpor route folder lain. Kode bersama naik ke
  lapisan resource/domain. Kode resource tidak boleh mengimpor route; kode
  domain tidak boleh mengimpor resource/route.
- Domain tidak boleh mengimpor domain lain. Batas ini diperiksa oleh
  `scripts/check-import-boundaries.mjs` lewat `npm run check`.

### Komponen dan hook

- Ekstrak hook/komponen sejak awal untuk setiap fitur (keputusan proyek).
- Hook mengembalikan state/perilaku, bukan JSX.
- Komponen yang mengembalikan JSX adalah komponen, bukan hook.
- Primitive shadcn dipakai langsung dari `@/shared/ui`; jangan membungkus ulang
  tanpa alasan.
- Komponen khusus resource tetap di `pages/<domain>/<resource>/components`;
  komponen lintas resource di `pages/<domain>/components`; kode generik di
  `shared/`.
- `DataTable` memakai API props-only: `columns`, `rows`, `rowKey`, `empty`,
  `toolbar`, `footer`.

### Styling dan Palet Warna

- **Dilarang keras hardcode warna**: Jangan gunakan kelas warna statis Tailwind (seperti `bg-lime-50`, `text-emerald-800`, `border-amber-300`, `bg-blue-500`, dsb.) maupun nilai warna inline (`#hex`, `rgb()`, `oklch()`).
- **Gunakan variabel semantik shadcn / CSS tokens dari `app.css`**:
    - Background & Permukaan: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-secondary`, `bg-primary`, `bg-accent`.
    - Teks: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-secondary-foreground`, `text-primary-foreground`, `text-destructive`.
    - Border & Outline: `border-border`, `border-input`, `ring-ring`.
    - Alpha/Opacity modifier diperbolehkan pada token semantik, misalnya `border-destructive/20`, `bg-destructive/10`, `bg-primary/10`, `ring-primary/20`.
- **Status & Feedback**:
    - Sukses / Konfirmasi: gunakan `border-border bg-secondary text-secondary-foreground` atau badge `variant="default"` / `variant="secondary"`.
    - Error / Bahaya / Kritis: gunakan `border-destructive/20 bg-destructive/10 text-destructive` atau badge `variant="destructive"`.
    - Netral / Peringatan Ringan: gunakan `border-border bg-muted/60 text-foreground` atau badge `variant="outline"`.
- Aturan ini menjamin seluruh komponen beradaptasi otomatis terhadap Theme Switcher (`light`, `dark`, `system`) dan perubahan palet terpusat.

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
