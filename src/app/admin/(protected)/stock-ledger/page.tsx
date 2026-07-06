import { createClient } from "@/lib/supabase/server"
import { StockLedgerTable } from "@/components/StockLedgerTable"
import { CATALOG_PAGE_SIZE, getRange, getTotalPages, parsePage } from "@/lib/pagination"

export default async function StockLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; page?: string }>
}) {
  const { product: productId, page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const supabase = await createClient()

  let movements: any[] = []
  let totalPages = 1
  let products: { id: string; name: string; sku: string }[] = []

  if (supabase) {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, sku")
      .order("name", { ascending: true })
    products = productsData || []

    const { from, to } = getRange(page)
    let query = supabase
      .from("stock_movements")
      .select("*, products(name, sku)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (productId) query = query.eq("product_id", productId)

    const { data, count } = await query
    movements = data || []
    totalPages = getTotalPages(count || 0, CATALOG_PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface-1 p-5">
        <p className="text-xs font-black uppercase text-interactive">Inventory</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Stock Ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Riwayat pergerakan stok dari pembuatan produk, transaksi pesanan, dan koreksi manual.
        </p>
      </div>

      <StockLedgerTable
        movements={movements}
        products={products}
        currentPage={page}
        totalPages={totalPages}
        selectedProductId={productId}
      />
    </div>
  )
}
