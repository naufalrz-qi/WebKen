import { createClient } from "@/lib/supabase/server"
import { EnvelopeSimple, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"
import { ProductImage } from "@/components/ProductImage"

export default async function ContactPage() {
  const supabase = await createClient()
  let section: any = null
  let settings: any = null
  if (supabase) {
    const [sectionRes, settingsRes] = await Promise.all([
      supabase.from("page_sections").select("*").eq("section_key", "contact").maybeSingle(),
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    ])
    section = sectionRes.data
    settings = settingsRes.data
  }

  const title = section?.title || "Hubungi Kami"
  const subtitle = section?.subtitle || "Ada pertanyaan soal produk atau pesanan? Kami siap membantu."
  const content = section?.content
  const whatsapp = settings?.whatsapp_number
  const email = settings?.contact_email
  const address = settings?.address

  const channels = [
    whatsapp && {
      icon: WhatsappLogo,
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp}`,
    },
    email && {
      icon: EnvelopeSimple,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    address && {
      icon: MapPin,
      label: "Alamat",
      value: address,
      href: null,
    },
  ].filter(Boolean) as { icon: any; label: string; value: string; href: string | null }[]

  return (
    <main className="mx-auto min-h-[64vh] w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <p className="text-xs font-black uppercase text-interactive">Contact</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>
      {content && (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{content}</p>
      )}

      <div className="mt-8 overflow-hidden rounded-md border border-border bg-surface-2">
        <ProductImage src={section?.image_url || '/uploads/images/no-image.webp'} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => {
          const inner = (
            <div className="flex items-start gap-3 rounded-md border border-border bg-surface-1 p-4">
              <channel.icon className="mt-0.5 size-5 text-interactive" weight="fill" />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase text-muted-foreground">{channel.label}</p>
                <p className="mt-1 break-words text-sm font-bold text-foreground">{channel.value}</p>
              </div>
            </div>
          )
          return channel.href ? (
            <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:[&>div]:border-interactive/40">
              {inner}
            </a>
          ) : (
            <div key={channel.label}>{inner}</div>
          )
        })}
      </div>
    </main>
  )
}
