"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr"
import { Pagination } from "@/components/Pagination"
import { SORT_OPTIONS } from "@/lib/pagination"

interface CatalogProps {
  products: any[]
  currentPage: number
  totalPages: number
  totalCount: number
  sort: string
}

export function Catalog({ products, currentPage, totalPages, totalCount, sort }: CatalogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-xs font-black uppercase text-interactive">Katalog</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Model terbaru
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {totalCount} produk siap ditelusuri berdasarkan nama, brand, atau SKU.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_180px]">
          <Link
            href="/search"
            className="relative flex h-11 items-center rounded-md border border-border bg-surface-1 pl-9 text-sm font-semibold text-muted-foreground transition-colors hover:border-interactive/45 hover:text-foreground"
          >
            <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            Cari model, brand, SKU
          </Link>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label="Urutkan produk"
              className="h-11 w-full rounded-md border border-border bg-surface-1 pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-interactive focus:ring-2 focus:ring-interactive/25"
              value={sort}
              onChange={(event) => handleSortChange(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id ?? product.sku} product={product} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <MagnifyingGlass className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="font-bold text-foreground">Belum ada produk</p>
            <p className="mt-2 text-sm text-muted-foreground">Cek lagi setelah stok baru ditambahkan.</p>
          </div>
        </div>
      )}
    </div>
  )
}
