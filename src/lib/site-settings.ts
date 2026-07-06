import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getSiteSettings = cache(async () => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle()

  return data
})
