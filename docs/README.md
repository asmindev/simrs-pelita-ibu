# Dokumentasi SIMRS

Dokumen ini adalah sumber konteks utama untuk manusia dan AI agent yang bekerja
di repositori ini. Baca sesuai urutan di bawah sebelum mengubah kode.

## Urutan baca

1. [stack.md](./stack.md) — versi dan tool yang benar-benar terpasang.
2. [system-design.md](./system-design.md) — arsitektur, alur data, RBAC, keamanan.
3. [project-structure.md](./project-structure.md) — struktur folder dan batas modul.
4. [conventions.md](./conventions.md) — aturan penulisan kode, nama, dokumen, git.
5. [prd/README.md](./prd/README.md) — peta domain dan prioritas rilis.
6. [tasks/README.md](./tasks/README.md) — urutan pekerjaan dan status.

## Status keputusan

- **LOCKED** — sudah diputuskan, jangan diubah tanpa persetujuan eksplisit.
- **PLANNED** — disepakati, belum diimplementasikan.
- **OPEN** — masih perlu keputusan.

## Ringkasan produk

SIMRS (Sistem Informasi Manajemen Rumah Sakit) untuk satu fasilitas. Fokus rilis
pertama adalah alur operasional inti: master data, pendaftaran, rekam medis,
farmasi, kasir, penunjang, rawat inap, serta fondasi RBAC dan audit.

- Backend: Laravel 13 + Inertia 3 + Fortify.
- Frontend: React 19 + TypeScript + Tailwind 4 + shadcn.
- Arsitektur frontend: feature-based per domain.
- Otorisasi: spatie/laravel-permission, role-only, scoping baris lewat Policy.
