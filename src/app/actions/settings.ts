'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteImageFile } from '@/lib/image-cleanup'

export async function updateSiteSettings(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const data = {
    site_name: formData.get('site_name') as string,
    whatsapp_number: formData.get('whatsapp_number') as string,
    seo_title: formData.get('seo_title') as string,
    seo_description: formData.get('seo_description') as string,
    contact_email: formData.get('contact_email') as string,
    address: formData.get('address') as string,
    bank_info: formData.get('bank_info') as string,
  }

  // Get current settings
  const { data: current } = await supabase.from('site_settings').select('id').limit(1).single()
  
  if (current) {
    const { error } = await supabase.from('site_settings').update(data).eq('id', current.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('site_settings').insert([data])
    if (error) return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: "Settings saved successfully" }
}

export async function updatePageSection(sectionKey: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const data = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    content: formData.get('content') as string,
    image_url: formData.get('image_url') as string,
  }

  // Check if exists
  const { data: current } = await supabase.from('page_sections').select('id, image_url').eq('section_key', sectionKey).single()

  if (current) {
    // Delete old image file if it changed
    if (current.image_url && current.image_url !== data.image_url) {
      await deleteImageFile(current.image_url)
    }

    const { error } = await supabase.from('page_sections').update(data).eq('id', current.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('page_sections').insert([{ section_key: sectionKey, ...data }])
    if (error) return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: "Page section saved successfully" }
}
