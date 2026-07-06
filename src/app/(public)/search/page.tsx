import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr"
import ProductCard from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { createClient } from "@/lib/supabase/server"
import { CATALOG_PAGE_SIZE, getRange, getTotalPages, parsePage } from "@/lib/pagination"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page: pageParam } = await searchParams
  const query = (q || "").trim()
  const page = parsePage(pageParam)

  const supabase = await createClient()

  let products: any[] = []
  let totalPages = 1
  let count = 0

  if (supabase && query) {
    const { data: matchingBrands } = await supabase
      .from("brands")
      .select("id")
      .ilike("name", `%${query}%`)
    const brandIds = (matchingBrands || []).map((b) => b.id)

    const orFilter = [
      `name.ilike.%${query}%`,
      `sku.ilike.%${query}%`,
      ...(brandIds.length > 0 ? [`brand_id.in.(${brandIds.join(",")})`] : []),
    ].join(",")

    const { from, to } = getRange(page)
    const { data, count: totalCount } = await supabase
      .from("products")
      .select("*, brands(name), product_images(*)", { count: "exact" })
      .eq("status", "Active")
      .or(orFilter)
      .order("created_at", { ascending: false })
      .range(from, to)

    products = data || []
    count = totalCount || 0
    totalPages = getTotalPages(count, CATALOG_PAGE_SIZE)
  }

  return (
    <main className="mx-auto min-h-[64vh] max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <p className="text-xs font-black uppercase text-interactive">Pencarian</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">
        {query ? `Hasil untuk "${query}"` : "Cari produk"}
      </h1>

      <form action="/search" method="get" className="relative mt-6 max-w-xl">
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Cari model, brand, SKU"
          aria-label="Cari produk"
          autoFocus
          className="h-12 w-full rounded-md border border-border bg-surface-1 pl-12 pr-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-interactive focus:ring-2 focus:ring-interactive/25"
        />
      </form>

      {query && <p className="mt-3 text-sm text-muted-foreground">{count} produk ditemukan.</p>}

      {!query ? (
        <div className="mt-8 grid min-h-[200px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Masukkan kata kunci nama model, brand, atau SKU di kotak pencarian.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 grid min-h-[260px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <MagnifyingGlass className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="font-bold text-foreground">Produk tidak ditemukan</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba kata kunci lain atau kosongkan pencarian.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </main>
  )
}
