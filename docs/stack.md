# Stack

Versi di bawah adalah versi yang terpasang saat dokumen ini ditulis. Selalu
verifikasi ulang dengan `composer show --direct` dan `package.json` sebelum
memakai API spesifik.

## Backend

| Komponen           | Versi                          | Catatan                                               |
| ------------------ | ------------------------------ | ----------------------------------------------------- |
| PHP                | runtime 8.5, constraint `^8.3` | Jangan asumsikan API di luar versi terpasang          |
| Laravel Framework  | 13.40.0 (`^13.17`)             | Struktur default Laravel 13                           |
| Inertia Laravel    | `^3.0`                         | Root view `resources/views/app.blade.php`             |
| Laravel Fortify    | `^1.37.2`                      | Login, logout, reset password; registrasi tidak aktif |
| Ziggy              | 2.6.5                          | URL route di FE, whitelist di `config/ziggy.php`      |
| Spatie Permission  | 8.4.0                          | RBAC, teams OFF, role-only                            |
| Spatie Activitylog | 5.1                            | Audit perubahan RBAC dan akses pasien                 |
| Pest               | `^5.3`                         | Test backend                                          |
| Larastan           | `^3.9`                         | Analisis statis                                       |
| Pint               | `^1.27`                        | Format PHP                                            |
| Laravel Boost      | `^2.2`                         | MCP dan panduan agent                                 |

Constraint PHP di `composer.json` masih `^8.3`, tetapi runtime pengembangan
memakai PHP 8.5. Gunakan API yang kompatibel dengan versi framework terpasang,
bukan asumsi dari memori.

## Database dan infrastruktur

| Komponen | Nilai              | Catatan                                           |
| -------- | ------------------ | ------------------------------------------------- |
| Database | MySQL              | `DB_CONNECTION=mysql`, database `simrs`           |
| Session  | database           | `SESSION_DRIVER=database`                         |
| Cache    | database           | `CACHE_STORE=database`                            |
| Queue    | database           | `QUEUE_CONNECTION=database`                       |
| Test DB  | MySQL `simrs_test` | `phpunit.xml`; terpisah dari database dev `simrs` |

## Frontend

| Komponen                           | Versi                               | Catatan                                        |
| ---------------------------------- | ----------------------------------- | ---------------------------------------------- |
| React / React DOM                  | `^19.2`                             |                                                |
| Inertia React                      | `^3.0`                              | `createInertiaApp`, layout default             |
| `@inertiajs/vite`                  | `^3.0`                              | Auto-resolve halaman dari `resources/js/pages` |
| TypeScript                         | `^5.7`                              | `tsc --noEmit`                                 |
| Vite                               | `vite-plus` 1.4.0                   | Alias `@voidzero-dev/vite-plus-core`           |
| Tailwind CSS                       | `^4.0` + `@tailwindcss/vite` `^4.1` |                                                |
| shadcn                             | CLI `^4.23`, style `radix-nova`     | Alias diarahkan ke `@/shared/*`                |
| `radix-ui`                         | `^1.8.1`                            | Primitive baru                                 |
| lucide-react                       | `^0.475`                            | Ikon                                           |
| sonner                             | `^2.0`                              | Toast                                          |
| CVA / clsx / tailwind-merge / `cn` | terpasang                           | Utilitas styling                               |
| Ziggy JS                           | `^2.6.5`                            | `route()` di FE                                |

## Tooling

| Perintah                                                           | Fungsi                                      |
| ------------------------------------------------------------------ | ------------------------------------------- |
| `npm run dev`                                                      | Vite dev server                             |
| `npm run build`                                                    | Build produksi                              |
| `npm run types:check`                                              | `tsc --noEmit`                              |
| `npm run check`                                                    | Lint + format + type-aware check            |
| `npm run check:fix`                                                | Perbaiki format/lint                        |
| `vendor/bin/pint --format agent`                                   | Format PHP                                  |
| `vendor/bin/pest` / `php artisan test --compact`                   | Test backend                                |
| `php artisan ziggy:generate resources/js/types/ziggy --types-only` | Regenerate tipe route setelah route berubah |

## Dependency yang direncanakan (PLANNED)

| Komponen                    | Tujuan                   |
| --------------------------- | ------------------------ |
| `react-i18next` + `i18next` | Internasionalisasi UI    |
| `vitest`                    | Unit/logic test frontend |

Jangan menambah dependency di luar daftar ini tanpa persetujuan.
