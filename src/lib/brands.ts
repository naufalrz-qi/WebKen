import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getBrandBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase.from("brands").select("*").eq("slug", slug).single()

  return data
})
