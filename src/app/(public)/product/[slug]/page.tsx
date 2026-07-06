import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@/components/ui/badge"
import { ProductGallery } from "@/components/ProductGallery"
import { createClient } from "@/lib/supabase/server"
import { getProductBySlug } from "@/lib/products"
import { AddToCart } from "@/components/cart/AddToCart"
import ProductCard from "@/components/ProductCard"

const RELATED_LIMIT = 4

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}

  const brandName = data.brands?.name || "W//KEN"
  const priceLabel = `Rp ${Number(data.price).toLocaleString("id-ID")}`
  const description = data.description || `${data.name} — ${brandName} — ${priceLabel}`
  const image = data.product_images?.[0]?.image_url

  return {
    title: data.name,
    description,
    openGraph: {
      title: data.name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) return notFound()

  const data = await getProductBySlug(slug)

  if (!data) return notFound()

  const gallery = (data.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((img: any) => img.image_url)
  const images: string[] = gallery.length > 0 ? gallery : ["/uploads/images/no-image.webp"]

  const stock = Number(data.stock ?? 0)
  const outOfStock = stock <= 0
  const priceLabel = `Rp ${Number(data.price).toLocaleString("id-ID")}`
  const brandName = data.brands?.name || "W//KEN"

  let related: any[] = []
  if (data.brand_id) {
    const { data: brandMatches } = await supabase
      .from("products")
      .select("*, brands(name), product_images(*)")
      .eq("brand_id", data.brand_id)
      .neq("id", data.id)
      .eq("status", "Active")
      .limit(RELATED_LIMIT)
    related = brandMatches || []
  }
  if (related.length < RELATED_LIMIT && data.category_id) {
    const excludeIds = [data.id, ...related.map((r) => r.id)]
    const { data: categoryMatches } = await supabase
      .from("products")
      .select("*, brands(name), product_images(*)")
      .eq("category_id", data.category_id)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .eq("status", "Active")
      .limit(RELATED_LIMIT - related.length)
    related = [...related, ...(categoryMatches || [])]
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke katalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <ProductGallery images={images} alt={data.name} />

        <section className="flex flex-col">
          <div className="rounded-md border border-border bg-surface-1 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border-transparent bg-info/10 text-info">
                {brandName}
              </Badge>
              <Badge
                variant={outOfStock ? "destructive" : "secondary"}
                className={
                  outOfStock
                    ? "border-transparent"
                    : "border-transparent bg-success/10 text-success hover:bg-success/15"
                }
              >
                {outOfStock ? "Stok habis" : `${stock} stok`}
              </Badge>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              {data.name}
            </h1>
            <p className="mt-5 text-3xl font-black text-interactive">{priceLabel}</p>

            <p className="mt-6 text-sm leading-7 text-muted-foreground md:text-base">
              {data.description}
            </p>

            <div className="mt-8 grid gap-3 border-y border-border py-5 sm:grid-cols-3">
              {[
                ["SKU", data.sku],
                ["Skala", data.scale],
                ["Kondisi", data.condition],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-surface-2 p-4">
                  <p className="text-[11px] font-black uppercase text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success" weight="fill" />
                Stok tercatat real-time
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-info" weight="fill" />
                Pesanan tersimpan rapi
              </div>
            </div>

            <div className="mt-8">
              <AddToCart
                product={{
                  id: data.id,
                  slug: data.slug,
                  name: data.name,
                  price: Number(data.price),
                  image: images[0],
                  sku: data.sku,
                  stock,
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-black uppercase text-interactive">Model serupa</h2>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
            Kamu mungkin juga suka
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
