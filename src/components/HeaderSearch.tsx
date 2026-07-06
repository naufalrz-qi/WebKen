import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr"

export function HeaderSearch() {
  return (
    <form action="/search" method="get" className="relative hidden md:block">
      <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name="q"
        placeholder="Cari model, brand, SKU"
        aria-label="Cari produk"
        className="h-9 w-56 rounded-md border border-border bg-surface-1 pl-9 pr-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-interactive focus:ring-2 focus:ring-interactive/25"
      />
    </form>
  )
}
