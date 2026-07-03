import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowRight, BookmarkSimple } from "@phosphor-icons/react/dist/ssr"
import { ProductImage } from "@/components/ProductImage"

export default async function BrandsPage() {
  const supabase = await createClient()
  let brands: any[] = []

  if (supabase) {
    const { data } = await supabase.from("brands").select("*").order("name")
    brands = data || []
  }

  return (
    <main className="mx-auto min-h-[64vh] max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-black uppercase text-interactive">Brands</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">
          Direktori brand koleksi
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
          Telusuri model berdasarkan produsen, seri, dan gaya koleksi yang kamu incar.
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <BookmarkSimple className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="font-bold text-foreground">Belum ada brand</p>
            <p className="mt-2 text-sm text-muted-foreground">Brand baru akan muncul setelah ditambahkan admin.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-6">
          {brands.map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.id}
              className="group flex min-h-44 flex-col justify-between rounded-md border border-border bg-surface-1 p-4 transition-all hover:-translate-y-0.5 hover:border-interactive/45 hover:shadow-[0_20px_48px_-34px_hsl(var(--foreground))]"
            >
              <div className="grid size-20 place-items-center overflow-hidden rounded-md bg-surface-2">
                <ProductImage
                  src={brand.logo_url || "/uploads/images/no-image.webp"}
                  alt={brand.name}
                  className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div className="mt-5">
                <p className="font-black leading-tight text-foreground">{brand.name}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-interactive">
                  Lihat model
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
