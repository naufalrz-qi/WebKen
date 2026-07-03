import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookmarkSimple } from "@phosphor-icons/react/dist/ssr"
import { ProductImage } from "@/components/ProductImage"
import ProductCard from "@/components/ProductCard"

export default async function BrandDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createClient()
  if (!supabase) return notFound()

  const { data: brand } = await supabase.from("brands").select("*").eq("slug", slug).single()
  if (!brand) return notFound()

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false })

  const formattedProducts =
    products?.map((product) => ({
      ...product,
      brand: brand.name,
      images:
        product.product_images
          ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img: any) => img.image_url) || [],
    })) || []

  return (
    <main className="mx-auto min-h-[64vh] max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/brands"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke brands
      </Link>

      <div className="mb-8 flex flex-col gap-5 rounded-md border border-border bg-surface-1 p-5 md:flex-row md:items-center md:p-6">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-2">
          <ProductImage
            src={brand.logo_url || "/uploads/images/no-image.webp"}
            alt={brand.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-interactive">Brand</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">
            {brand.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {formattedProducts.length} model tersedia di katalog.
          </p>
        </div>
      </div>

      {formattedProducts.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <BookmarkSimple className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="font-bold text-foreground">Belum ada model untuk brand ini</p>
            <p className="mt-2 text-sm text-muted-foreground">Cek lagi setelah stok baru ditambahkan.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {formattedProducts.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
