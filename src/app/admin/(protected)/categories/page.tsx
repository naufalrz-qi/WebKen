import { createClient } from "@/lib/supabase/server"
import { CategoriesTable } from "@/components/CategoriesTable"

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  let categories: any[] = []
  if (supabase) {
    const { data } = await supabase.from('categories').select('*').order('name')
    categories = data || []
  }

  return (
    <div className="space-y-6">
      <CategoriesTable initialData={categories} />
    </div>
  )
}
