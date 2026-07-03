import Link from "next/link"
import { LockKey } from "@phosphor-icons/react/dist/ssr"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1fr_480px]">
      <section className="relative hidden overflow-hidden border-r border-border bg-foreground text-background lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-interactive" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-background text-sm font-black text-foreground">
              W
            </span>
            <span className="font-black tracking-tight">W//KEN</span>
          </Link>
          <div>
            <p className="text-xs font-black uppercase opacity-70">Inventory desk</p>
            <h1 className="mt-3 max-w-lg text-5xl font-black leading-none tracking-tight">
              Kelola koleksi dengan data yang rapi.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 opacity-75">
              Produk, brand, kategori, dan konten toko ada dalam satu portal kerja.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-md border border-border bg-surface-1 p-6 shadow-[0_22px_60px_-42px_hsl(var(--foreground))]">
          <div className="mb-8">
            <div className="mb-4 grid size-12 place-items-center rounded-md bg-surface-2 ring-1 ring-border">
              <LockKey className="size-5 text-interactive" weight="fill" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Admin Portal</h2>
            <p className="mt-2 text-sm text-muted-foreground">Masuk untuk mengelola katalog W//KEN.</p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  )
}
