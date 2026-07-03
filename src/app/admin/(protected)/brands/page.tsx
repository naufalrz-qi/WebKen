import { createClient } from "@/lib/supabase/server"
import { BrandsTable } from "@/components/BrandsTable"

export default async function BrandsPage() {
  const supabase = await createClient()
  
  let brands: any[] = []
  if (supabase) {
    const { data } = await supabase.from('brands').select('*').order('name')
    brands = data || []
  }

  return (
    <div className="space-y-6">
      <BrandsTable initialData={brands} />
    </div>
  )
}
