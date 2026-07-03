# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ Non-standard Next.js version

This project runs **Next.js 16.2.9**, which has breaking changes vs. training-data Next.js. Before writing any code that touches routing, data fetching, caching, or config, read the relevant guide in `node_modules/next/dist/docs/` (organized as `01-app/`, `02-guides/`, `03-architecture/`, `04-community/`).

The one that already bit this repo: **`middleware.ts` is now `proxy.ts`**. The exported function is named `proxy`, not `middleware`, and it lives at `src/proxy.ts`. See `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, next/core-web-vitals + next/typescript)
```

No test runner is configured in this repo.

## Architecture

**W//KEN** — a diecast model storefront with a self-service admin backend. Indonesian-language storefront (Bahasa Indonesia copy, Rupiah pricing, WhatsApp checkout instead of a cart).

### Route structure (`src/app`)

- `(public)/` — storefront: catalog listing, `brands/[slug]`, `product/[slug]`.
- `admin/login/` — login form, outside auth protection.
- `admin/(protected)/` — dashboard, products, brands, categories, settings. Auth is enforced in `src/proxy.ts`, **not** in `admin/(protected)/layout.tsx` — the layout renders shell chrome only and assumes the proxy already redirected unauthenticated requests.
- `actions/` — all mutations live here as Server Actions (`'use server'`), one file per domain (`auth.ts`, `products.ts`, `taxonomy.ts`, `settings.ts`). Actions follow the `useActionState` shape: `(prevState, formData) => { error? }`, then `revalidatePath(...)` + `redirect(...)` on success. Follow this shape for new mutations rather than throwing/returning raw data.
- `api/upload/route.ts` — the one non-action mutation path. Auth-checks via Supabase session, converts uploads to webp with `sharp` (max 1200px), writes into `public/uploads/images/`, returns the public URL. Product images are stored as plain URL strings (comma-joined in forms), not a `File`/blob column.

### Supabase "mock mode"

`src/lib/supabase/client.ts` and `server.ts` both check whether `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are real (i.e. not the placeholder `your-project-url` / `your-publishable-key`) via `isSupabaseConfigured()`. If unconfigured, `createClient()` returns `null` instead of throwing. Every call site is expected to branch on a null client and fall back to hardcoded mock data (see `mockProduct` in `product/[slug]/page.tsx`) so the storefront stays browsable with zero setup. When adding a new data-fetching page or action, preserve this fallback pattern instead of assuming Supabase is always present.

`src/proxy.ts` does the same check before running any auth redirect logic, so proxy is a no-op when Supabase isn't configured.

### Database (`supabase/schema.sql`)

Single schema file, no migration tooling — apply it directly in the Supabase SQL editor. Key points:
- `products.stock` is **derived**, not writable directly: a trigger (`recalculate_product_stock`) recomputes it from the `stock_movements` ledger (`in`/`adjustment` add, `out`/`damaged` subtract) any time a movement row changes. To change stock, insert a `stock_movements` row — don't `UPDATE products SET stock = ...`.
- RLS is on for every table: public `SELECT` is open, all writes require `auth.role() = 'authenticated'`. There is no per-row ownership model — any authenticated user is a full admin.
- `product_images` and `stock_movements` cascade-delete with their parent product.

### UI system

- shadcn/ui (`components.json`, style `base-nova`, base color `neutral`) — primitives in `src/components/ui/`, icons from `@phosphor-icons/react` (not lucide, despite it being in `iconLibrary`/deps).
- Theming via `next-themes` (`ThemeProvider`/`ThemeToggle`), class-based dark mode.
- Colors are HSL custom properties defined twice in `src/app/globals.css` (`:root` and `.dark`), then re-exposed as `--color-*` for Tailwind v4's `@theme`. Custom surface scale (`surface-1/2/3`, `canvas`, `border`, `border-subtle`) and semantic tokens (`interactive`, `critical`/`high`/`medium`/`low`, `info`, `success`) sit alongside the standard shadcn tokens (`primary`, `muted`, `destructive`, etc.) — prefer the semantic tokens already in use in a given area over inventing new colors.
