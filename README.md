# Apotek CMS — Green Pharmacy Hub

CMS (Content Management System) dan landing page untuk apotek, dibangun dengan **TanStack Start**, **React 19**, **TailwindCSS v4**, dan database **SQLite** lokal (file-based, tanpa layanan eksternal).

## Fitur

### Halaman Publik
- **Beranda** — hero, kategori produk, produk unggulan, layanan, promo, testimoni, artikel, cabang, CTA WhatsApp
- **Katalog Produk** — listing dengan filter kategori & pencarian, halaman detail produk
- **Blog Artikel** — daftar artikel kesehatan & halaman detail
- **Layanan, Promo, Cabang, FAQ, Tentang, Kontak** — halaman statis dinamis
- **Form Kontak** — pesan langsung tersimpan ke database
- **WhatsApp Float** — tombol mengambang untuk chat WhatsApp
- **Sitemap.xml** — sitemap dinamis untuk SEO

### Panel Admin (`/admin`)
- **Dashboard** — statistik konten & pesan terbaru
- **CRUD lengkap** untuk: Produk, Kategori Produk, Layanan, Promo, Artikel, Kategori Artikel, Testimoni, Cabang, Tim Apoteker, FAQ, Pesan Masuk
- **Media Library** — upload & kelola gambar (disimpan ke `public/uploads/`)
- **Pengaturan Situs** — nama apotek, kontak, sosial media, SEO, warna aksen (khusus Super Admin)
- **Manajemen Pengguna & Role** — tambah/hapus user, toggle role, set password (khusus Super Admin)

### Autentikasi & Otorisasi
- Login email/password berbasis **session cookie** (HttpOnly, 30 hari)
- 3 role: `super_admin`, `admin_konten`, `staf`
- Proteksi route admin — hanya admin yang bisa akses
- Super Admin eksklusif untuk Pengaturan & Manajemen Pengguna

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Framework | TanStack Start (SSR) + Vite |
| UI | React 19, TailwindCSS v4, Radix UI (shadcn-style) |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query |
| Database | SQLite (`better-sqlite3`) — file `data/app.db` |
| Auth | Session cookie + scrypt password hashing |
| Forms | react-hook-form + Zod |
| Icons | lucide-react |

## Cara Menjalankan

### Prasyarat
- **Node.js** v20+ dan **npm**
- Sistem operasi yang mendukung native module (`better-sqlite3` memerlukan compiler untuk build)

### Instalasi

```bash
npm install
```

> Jika `better-sqlite3` gagal build, pastikan `python3` dan `make`/`g++` tersedia di sistem. Alternatif: `npm rebuild better-sqlite3`.

### Menjalankan Dev Server

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:8080**.

Database SQLite (`data/app.db`) dibuat otomatis saat pertama kali dijalankan, lengkap dengan schema dan data seed (admin user + pengaturan default).

### Build Produksi

```bash
npm run build
npm run preview
```

## Login Default

Saat database pertama dibuat, satu akun admin otomatis dibuat:

| Field | Nilai |
|-------|-------|
| Email | `admin@apoteksehat.id` |
| Password | `admin123` |
| Role | `super_admin` |

> **Penting:** Ganti password admin setelah login pertama melalui menu *Pengguna & Role*.

## Struktur Proyek

```
├── src/
│   ├── routes/              # File-based routing (TanStack Router)
│   │   ├── __root.tsx      # Root shell, providers, error/404
│   │   ├── index.tsx       # Landing page publik
│   │   ├── auth.tsx        # Halaman login/daftar
│   │   ├── admin.tsx       # Layout admin (sidebar + guard)
│   │   ├── admin.*.tsx     # 15 resource admin (CRUD)
│   │   ├── produk.*, artikel.*, layanan, promo, dll
│   │   └── sitemap[.]xml.ts
│   ├── components/
│   │   ├── admin/          # CmsResource (CRUD generik), FormControls
│   │   ├── public/         # Header, Footer, WhatsAppFloat, PublicLayout
│   │   └── ui/             # Primitif Radix (shadcn)
│   ├── lib/
│   │   ├── server/         # Server-only: db, auth, repo, crypto, session
│   │   ├── *.functions.ts  # Server functions (RPC client→server)
│   │   ├── auth.ts         # useAuth hook + doSignIn/doSignUp/doSignOut
│   │   ├── queries.ts      # Fetcher publik (wrapper server functions)
│   │   ├── media.ts        # Upload/list/delete media
│   │   └── utils.ts
│   ├── start.ts            # Konfigurasi TanStack Start (middleware)
│   ├── server.ts           # SSR entry + error handling
│   └── styles.css
├── public/
│   ├── images/             # Aset gambar statis
│   └── uploads/            # Upload media (generated, gitignored)
├── data/                   # Database SQLite (generated, gitignored)
│   └── app.db
└── package.json
```

## Arsitektur Data

### Server-side (`src/lib/server/`)

Semua akses database hanya terjadi di server, tidak pernah di client bundle:

- **`db.server.ts`** — koneksi `better-sqlite3`, definisi schema (14 tabel), auto-seed admin user + settings
- **`crypto.server.ts`** — hashing password (scrypt) & token generator
- **`auth.server.ts`** — manajemen session, user CRUD, role assignment
- **`repo.server.ts`** — semua query & mutasi data (publik + admin CRUD generik)
- **`session.ts`** — helper baca cookie session di server functions

### Client → Server RPC

Komunikasi client ke server melalui **TanStack Start server functions**:

| File | Fungsi |
|------|--------|
| `auth.functions.ts` | `getSession`, `signIn`, `signUp`, `signOut` |
| `queries.functions.ts` | Fetch data publik (settings, products, articles, dll) |
| `cms.functions.ts` | `cmsList`, `cmsInsert`, `cmsUpdate`, `cmsDelete`, `cmsOptions`, `cmsCount` |
| `media.functions.ts` | Upload/list/delete media |
| `contact.functions.ts` | CRUD pesan kontak |
| `settings.functions.ts` | Simpan pengaturan situs |
| `admin-users.functions.ts` | CRUD user + role toggle |

### Skema Database (14 tabel)

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Akun login (email, password_hash, full_name) |
| `user_roles` | Role assignment (super_admin, admin_konten, staf) |
| `sessions` | Session token untuk login berbasis cookie |
| `product_categories` | Kategori produk |
| `products` | Katalog produk/obat |
| `services` | Layanan apotek |
| `promotions` | Promo/banner dengan rentang tanggal |
| `article_categories` | Kategori artikel |
| `articles` | Artikel/blog kesehatan |
| `branches` | Cabang/lokasi apotek |
| `team_members` | Tim apoteker |
| `testimonials` | Testimoni pelanggan |
| `faqs` | FAQ |
| `contact_messages` | Pesan dari form kontak |
| `media` | Media library (referensi file upload) |
| `site_settings` | Pengaturan situs (key-value JSON) |

## Menambahkan Resource CMS Baru

Untuk menambahkan resource baru ke panel admin, buat file `src/routes/admin.<nama>.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { CmsResource, statusOptions } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/<nama>")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "<nama_tabel>",
  title: "Judul Resource",
  singular: "Item",
  orderBy: { column: "created_at", ascending: false },
  searchField: "name",
  defaults: { status: "draft" },
  columns: [
    { key: "name", label: "Nama" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { name: "name", label: "Nama", required: true },
    { name: "status", label: "Status", type: "select", options: statusOptions },
  ],
};
```

Tambahkan juga tabel terkait di `src/lib/server/db.server.ts` (bagian `SCHEMA`).

## Tipe Field yang Didukung

Form admin mendukung tipe field berikut:

| Tipe | Deskripsi |
|------|-----------|
| `text` | Input teks (default) |
| `textarea` | Textarea multi-baris |
| `richtext` | Textarea besar untuk konten |
| `number` | Input angka |
| `boolean` | Checkbox |
| `select` | Dropdown (opsi statis atau dinamis dari tabel lain) |
| `date` | DateTime picker |
| `image` | Upload gambar (via Media Library) |
| `slug` | Input slug dengan tombol auto-generate dari field lain |
| `email` | Input email |

## Backup & Reset Database

Database tersimpan sebagai file tunggal di `data/app.db`.

```bash
# Backup
cp data/app.db data/app-backup-$(date +%Y%m%d).db

# Reset (hapus database, akan dibuat ulang + seed saat server start)
rm -f data/app.db data/app.db-shm data/app.db-wal
```

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan dev server (Vite, HMR) |
| `npm run build` | Build produksi |
| `npm run build:dev` | Build mode development |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Jalankan ESLint |
| `npm run format` | Format kode dengan Prettier |

## Kontribusi

1. Gunakan branching terpisah untuk setiap fitur
2. Jalankan `npm run lint` sebelum commit
3. Jangan commit file `data/` atau `public/uploads/` (sudah di-gitignore)
