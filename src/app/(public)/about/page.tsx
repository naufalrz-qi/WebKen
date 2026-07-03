import { ProductImage } from "@/components/ProductImage"
import { createClient } from "@/lib/supabase/server"

export default async function AboutPage() {
  const supabase = await createClient()
  let section: any = null
  if (supabase) {
    const { data } = await supabase
      .from("page_sections")
      .select("*")
      .eq("section_key", "about")
      .maybeSingle()
    section = data
  }

  const title = section?.title || "Tentang W//KEN"
  const subtitle = section?.subtitle || "Diecast pilihan untuk kolektor Indonesia."
  const content =
    section?.content ||
    "W//KEN adalah toko diecast yang fokus pada kurasi model skala kecil dengan kondisi yang jelas dan riwayat stok yang rapi."

  return (
    <main className="mx-auto min-h-[64vh] w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <p className="text-xs font-black uppercase text-interactive">About</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>

      <div className="mt-8 overflow-hidden rounded-md border border-border bg-surface-2">
        <ProductImage src={section?.image_url || '/uploads/images/no-image.webp'} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="mt-8 whitespace-pre-line text-sm leading-7 text-muted-foreground md:text-base">
        {content}
      </div>
    </main>
  )
}
