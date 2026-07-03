import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ProductImage"
import { createClient } from "@/lib/supabase/server"
import { AddToCart } from "@/components/cart/AddToCart"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) return notFound()

  const { data } = await supabase
    .from("products")
    .select("*, brands(*), product_images(*)")
    .eq("slug", slug)
    .single()

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
        <section className="space-y-4">
          <div className="overflow-hidden rounded-md border border-border bg-surface-1 p-2">
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
              <ProductImage src={images[0]} alt={data.name} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, index) => (
              <div
                key={`${img}-${index}`}
                className={`aspect-square overflow-hidden rounded-md border bg-surface-2 ${
                  index === 0 ? "border-interactive" : "border-border opacity-70"
                }`}
              >
                <ProductImage src={img} alt={`${data.name} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>

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
    </main>
  )
}
