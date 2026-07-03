import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, Package, ShieldCheck } from "@phosphor-icons/react/dist/ssr"
import { ProductImage } from "@/components/ProductImage"
import { createClient } from "@/lib/supabase/server"
import { Catalog } from "@/components/Catalog"

export default async function HomePage() {
  const supabase = await createClient()

  let heroSection: any = null
  let products: any[] = []

  if (supabase) {
    const { data: heroData } = await supabase
      .from("page_sections")
      .select("*")
      .eq("section_key", "hero")
      .single()
    heroSection = heroData

    const { data: productsData } = await supabase
      .from("products")
      .select(`
        *,
        brands (name),
        categories (name),
        product_images (image_url, is_primary, sort_order)
      `)
      .eq("status", "Active")
      .order("created_at", { ascending: false })
    products = productsData || []
  }

  const heroTitle = heroSection?.title || "Diecast kurasi untuk kolektor yang teliti"
  const heroSubtitle =
    heroSection?.subtitle ||
    "Skala 1:64 dan 1:43, kondisi jelas, foto aktual, dan stok siap dikirim."
  const heroImage = heroSection?.image_url || "/uploads/images/no-image.webp"
  const inStock = products.reduce((sum, product) => sum + (product.stock || 0), 0)
  const latestImage =
    products[0]?.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))?.[0]
      ?.image_url || heroImage

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden border-b border-border">
        <Image
          src={heroImage}
          alt="W//KEN diecast display"
          fill
          priority
          className="object-cover opacity-[0.22] dark:opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/25" />
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-end gap-8 px-4 pb-10 pt-14 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:pb-12 lg:min-h-[600px]">
          <div className="max-w-3xl pb-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/85 px-3 py-1 text-xs font-bold uppercase text-muted-foreground backdrop-blur">
              <span className="size-2 rounded-full bg-interactive" />
              W//KEN Collector Store
            </div>
            <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#catalog"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-interactive px-5 text-sm font-bold text-white transition-colors hover:bg-interactive-hover"
              >
                Lihat katalog
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/brands"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface-1 px-5 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
              >
                Jelajahi brand
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-auto max-w-sm rounded-md border border-border bg-surface-1 p-3 shadow-[0_22px_60px_-38px_hsl(var(--foreground))]">
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
                <ProductImage src={latestImage} alt="Latest diecast model" className="h-full w-full object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm bg-surface-2 px-2 py-3">
                  <p className="text-lg font-black">{products.length}</p>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Model</p>
                </div>
                <div className="rounded-sm bg-surface-2 px-2 py-3">
                  <p className="text-lg font-black">{inStock}</p>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Stok</p>
                </div>
                <div className="rounded-sm bg-surface-2 px-2 py-3">
                  <p className="text-lg font-black">1:64</p>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Fokus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 text-sm md:grid-cols-3 md:px-6">
          {[
            { icon: CheckCircle, title: "Foto aktual", text: "Gambar produk dipakai sebagai acuan kondisi." },
            { icon: ShieldCheck, title: "Kondisi jelas", text: "SKU, skala, dan status stok tampil di setiap item." },
            { icon: Package, title: "Siap dikirim", text: "Pesanan diteruskan via WhatsApp untuk konfirmasi cepat." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-md border border-border bg-background p-4">
              <item.icon className="mt-0.5 size-5 text-interactive" weight="fill" />
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <Catalog initialProducts={products} />
      </section>
    </div>
  )
}
