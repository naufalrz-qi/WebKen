import { createClient } from "@/lib/supabase/server"
import { ProductsTable } from "@/components/ProductsTable"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  let products: any[] = []
  let brands: any[] = []
  let categories: any[] = []

  if (supabase) {
    const [productsRes, brandsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*, brands(*), product_images(*)').order('created_at', { ascending: false }),
      supabase.from('brands').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ])

    if (productsRes.data && productsRes.data.length > 0) {
      products = productsRes.data.map(p => ({
        ...p,
        brand: p.brands?.name || 'Unknown'
      }))
    }
    brands = brandsRes.data || []
    categories = categoriesRes.data || []
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface-1 p-5">
        <p className="text-xs font-black uppercase text-interactive">Catalog desk</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage product catalog and stock levels.</p>
      </div>

      <ProductsTable initialData={products} brands={brands} categories={categories} />
    </div>
  )
}
