import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("products")
    .select("*, brands(*), product_images(*)")
    .eq("slug", slug)
    .single()

  return data
})
