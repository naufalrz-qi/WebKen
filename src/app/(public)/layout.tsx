import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartProvider } from "@/components/cart/CartProvider"
import { CartButton } from "@/components/cart/CartButton"
import { HeaderSearch } from "@/components/HeaderSearch"

const navItems = [
  { href: "/", label: "Katalog" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-foreground text-sm font-black text-background">
                W
              </span>
              <span className="leading-none">
                <span className="block text-base font-black tracking-tight">W//KEN</span>
                <span className="block text-[11px] font-semibold uppercase text-muted-foreground">
                  Collector Store
                </span>
              </span>
            </Link>

            <nav className="order-3 flex w-full items-center gap-1 rounded-md border border-border bg-surface-1 p-1 md:order-none md:w-auto md:bg-transparent">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 rounded-sm px-3 py-2 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground md:flex-none"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <HeaderSearch />
              <ThemeToggle />
              <CartButton />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-surface-1">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr] md:px-6">
            <div>
              <Link href="/" className="text-lg font-black tracking-tight">
                W//KEN
              </Link>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Diecast pilihan untuk kolektor Indonesia, dikurasi dengan fokus pada kondisi,
                detail, dan riwayat stok yang jelas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-foreground">Store</span>
                <Link href="/" className="text-muted-foreground hover:text-interactive">
                  Katalog
                </Link>
                <Link href="/brands" className="text-muted-foreground hover:text-interactive">
                  Brands
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-foreground">Info</span>
                <Link href="/about" className="text-muted-foreground hover:text-interactive">
                  About
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-interactive">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
            (c) {new Date().getFullYear()} W//KEN. All rights reserved.
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
