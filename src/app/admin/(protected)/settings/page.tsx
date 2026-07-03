import { createClient } from "@/lib/supabase/server"
import { SettingsForm, PageSectionForm } from "./settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  let settings = null
  let heroSection = null
  let aboutSection = null
  let contactSection = null

  if (supabase) {
    const [settingsRes, heroRes, aboutRes, contactRes] = await Promise.all([
      supabase.from('site_settings').select('*').limit(1).maybeSingle(),
      supabase.from('page_sections').select('*').eq('section_key', 'hero').maybeSingle(),
      supabase.from('page_sections').select('*').eq('section_key', 'about').maybeSingle(),
      supabase.from('page_sections').select('*').eq('section_key', 'contact').maybeSingle(),
    ])
    settings = settingsRes.data
    heroSection = heroRes.data
    aboutSection = aboutRes.data
    contactSection = contactRes.data
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-md border border-border bg-surface-1 p-5">
        <p className="text-xs font-black uppercase text-interactive">Configuration</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Global Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage site configuration and content pages.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4 rounded-md border border-border bg-surface-1 p-6">
          <h2 className="border-b border-border pb-3 text-sm font-black uppercase text-foreground">Site Configuration</h2>
          <SettingsForm settings={settings} />
        </section>

        <section className="space-y-4 rounded-md border border-border bg-surface-1 p-6">
          <h2 className="border-b border-border pb-3 text-sm font-black uppercase text-foreground">Home Page (Hero Section)</h2>
          <PageSectionForm sectionKey="hero" section={heroSection} />
        </section>

        <section className="space-y-4 rounded-md border border-border bg-surface-1 p-6">
          <h2 className="border-b border-border pb-3 text-sm font-black uppercase text-foreground">About Page Content</h2>
          <PageSectionForm sectionKey="about" section={aboutSection} />
        </section>

        <section className="space-y-4 rounded-md border border-border bg-surface-1 p-6">
          <h2 className="border-b border-border pb-3 text-sm font-black uppercase text-foreground">Contact Page Content</h2>
          <PageSectionForm sectionKey="contact" section={contactSection} />
        </section>
      </div>
    </div>
  )
}
