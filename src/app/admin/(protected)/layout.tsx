import { ThemeToggle } from "@/components/theme-toggle"
import { AdminSidebar } from "@/components/AdminSidebar"
import { requireAdmin } from "@/lib/supabase/server"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-[100dvh] bg-background text-sm text-foreground">
      <aside className="hidden w-72 shrink-0 border-r border-border bg-surface-1 md:flex md:flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-foreground text-sm font-black text-background">
              W
            </span>
            <span>
              <span className="block font-black tracking-tight">W//KEN OPS</span>
              <span className="block text-[11px] font-semibold uppercase text-muted-foreground">
                Inventory desk
              </span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-border bg-surface-1 px-4 md:hidden">
          <Link href="/admin" className="font-black tracking-tight">
            W//KEN OPS
          </Link>
          <ThemeToggle />
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4 py-2 md:hidden">
          {[
            ["/admin", "Dashboard"],
            ["/admin/orders", "Orders"],
            ["/admin/products", "Inventory"],
            ["/admin/brands", "Brands"],
            ["/admin/categories", "Categories"],
            ["/admin/settings", "Settings"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
