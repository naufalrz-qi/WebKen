# W//KEN — Diecast Collector Store

Toko diecast skala kecil pilihan untuk kolektor Indonesia. Dibangun dengan Next.js 16, Supabase, dan Tailwind CSS.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Image Processing | [Sharp](https://sharp.pixelplumbing.com) (auto-convert ke WebP) |
| Icons | [Phosphor Icons](https://phosphoricons.com) + [Lucide](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

## Fitur

- 🏪 **Catalog publik** — halaman produk, brand, about, kontak
- 🛒 **Cart & Checkout** — guest checkout via WhatsApp
- 🔐 **Admin panel** — CRUD produk, brand, kategori, order, settings
- 📦 **Stock ledger** — stok otomatis dihitung dari movement (in/out/adjustment/damaged)
- 🖼️ **Image upload** — auto-convert ke WebP, auto-cleanup saat entity dihapus/diupdate
- 🎨 **Theme** — light mode default, dark mode ready
- 🔒 **RLS** — Row Level Security di semua tabel, role-based (admin/customer)

## Prasyarat

- [Node.js](https://nodejs.org) 18.17+
- Akun [Supabase](https://supabase.com) (free tier cukup)

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd webken
npm install
```

### 2. Setup environment

```bash
cp .env.example .env.local
```

Isi nilai di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

> Dapatkan dari [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 3. Setup database

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan secara berurutan:

```
supabase/schema.sql   ← buat tabel, RLS policies, triggers
supabase/seed.sql     ← data contoh + admin account
```

### 4. Run development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Halaman publik (home, about, brands, product, dll)
│   ├── admin/
│   │   ├── login/         # Halaman login admin
│   │   └── (protected)/   # Dashboard admin (products, brands, categories, orders, settings)
│   ├── actions/           # Server actions (CRUD operations)
│   ├── api/
│   │   ├── upload/        # Image upload endpoint
│   │   └── image/         # Image serve & delete endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components (UI, admin, cart)
└── lib/
    ├── supabase/          # Supabase client (server & browser)
    ├── image-cleanup.ts   # Image file cleanup utility
    └── utils.ts           # Shared utilities

supabase/
├── schema.sql             # Database DDL + RLS + triggers
└── seed.sql               # Sample data + admin user
```

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Import di Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository dari GitHub
3. Tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Klik **Deploy**

### ⚠️ Catatan Penting: Image Storage

Aplikasi ini menyimpan gambar upload di **local filesystem** (`public/uploads/images/`). Ini berfungsi sempurna di **development** dan **VPS/self-hosted**, tapi di **Vercel** filesystem bersifat **ephemeral** — gambar upload akan **hilang setiap kali deploy ulang**.

**Solusi untuk production di Vercel:**
- Migrasi ke [Supabase Storage](https://supabase.com/storage) (gratis 1 GB di paid plan)
- Atau gunakan [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (gratis 256 MB)
- Atau gunakan [Cloudinary](https://cloudinary.com) (gratis 25 GB bandwidth/bulan)

Untuk saat ini, gambar produk tetap bisa menggunakan URL eksternal (Unsplash, dll) yang tidak terpengaruh masalah ini.

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Jalankan ESLint |

## Admin Login

Setelah menjalankan `seed.sql`, gunakan kredensial berikut:

| Field | Value |
|-------|-------|
| Email | *(lihat di `supabase/seed.sql`)* |
| Password | *(lihat di `supabase/seed.sql`)* |

## License

Private — All rights reserved.
