import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/brands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ]

  const supabase = await createClient()
  if (!supabase) return staticRoutes

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("status", "Active"),
    supabase.from("brands").select("slug"),
  ])

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const brandRoutes: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${SITE_URL}/brands/${brand.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
