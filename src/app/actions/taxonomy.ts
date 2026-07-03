'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteImageFile } from '@/lib/image-cleanup'

// --- BRANDS ---

export async function createBrand(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const data = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    logo_url: formData.get('logo_url') as string,
  }

  const { error } = await supabase.from('brands').insert([data])
  if (error) return { error: error.message }

  revalidatePath('/admin/brands')
  revalidatePath('/brands')
  redirect('/admin/brands')
}

export async function updateBrand(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  // Fetch old logo to detect changes
  const { data: oldBrand } = await supabase
    .from('brands')
    .select('logo_url')
    .eq('id', id)
    .single()

  const data = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    logo_url: formData.get('logo_url') as string,
  }

  const { error } = await supabase.from('brands').update(data).eq('id', id)
  if (error) return { error: error.message }

  // Delete old logo file if it changed
  if (oldBrand?.logo_url && oldBrand.logo_url !== data.logo_url) {
    await deleteImageFile(oldBrand.logo_url)
  }

  revalidatePath('/admin/brands')
  revalidatePath('/brands')
  redirect('/admin/brands')
}

export async function deleteBrand(id: string) {
  const supabase = await createClient()
  if (!supabase) return

  // Fetch brand logo to delete file
  const { data: brand } = await supabase
    .from('brands')
    .select('logo_url')
    .eq('id', id)
    .single()

  // Delete logo file from server
  await deleteImageFile(brand?.logo_url)

  await supabase.from('brands').delete().eq('id', id)

  revalidatePath('/admin/brands')
  revalidatePath('/brands')
  redirect('/admin/brands')
}

// --- CATEGORIES ---

export async function createCategory(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const data = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const { error } = await supabase.from('categories').insert([data])
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const data = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const { error } = await supabase.from('categories').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  if (!supabase) return

  await supabase.from('categories').delete().eq('id', id)

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}
