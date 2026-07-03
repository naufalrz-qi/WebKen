"use client"

import { useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr"
import { Input } from "@/components/ui/input"

export function Catalog({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("Terbaru")

  const sortedProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filteredProducts = initialProducts.filter((product) => {
      if (!query) return true

      return (
        product.name?.toLowerCase().includes(query) ||
        product.brands?.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      )
    })

    return [...filteredProducts].sort((a, b) => {
      switch (sort) {
        case "Harga: Rendah ke Tinggi":
          return Number(a.price) - Number(b.price)
        case "Harga: Tinggi ke Rendah":
          return Number(b.price) - Number(a.price)
        case "A-Z":
          return a.name.localeCompare(b.name)
        case "Terbaru":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [initialProducts, search, sort])

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-xs font-black uppercase text-interactive">Katalog</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Model terbaru
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {sortedProducts.length} produk siap ditelusuri berdasarkan nama, brand, atau SKU.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_180px]">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari model, brand, SKU"
              className="h-11 bg-surface-1 pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label="Urutkan produk"
              className="h-11 w-full rounded-md border border-border bg-surface-1 pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-interactive focus:ring-2 focus:ring-interactive/25"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option>Terbaru</option>
              <option>Harga: Rendah ke Tinggi</option>
              <option>Harga: Tinggi ke Rendah</option>
              <option>A-Z</option>
            </select>
          </label>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id ?? product.sku} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <MagnifyingGlass className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="font-bold text-foreground">Produk tidak ditemukan</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba kata kunci lain atau kosongkan pencarian.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
