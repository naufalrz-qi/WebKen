'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteImageFiles, cleanupRemovedImages } from '@/lib/image-cleanup'

export async function createProduct(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  const initialStock = Number(formData.get('stock')) || 0;
  
  // Extract images
  const imagesRaw = formData.get('images') as string
  const imagesList = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : []

  const data = {
    sku: formData.get('sku') as string,
    slug: formData.get('slug') as string,
    name: formData.get('name') as string,
    brand_id: formData.get('brand_id') as string || null,
    category_id: formData.get('category_id') as string || null,
    scale: formData.get('scale') as string,
    condition: formData.get('condition') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    status: formData.get('status') as string || 'Active',
  }

  // Insert product
  const { data: product, error } = await supabase.from('products').insert([data]).select('id').single()
  if (error) return { error: error.message }

  // Insert initial stock movement
  if (initialStock > 0 && product) {
    await supabase.from('stock_movements').insert([{
      product_id: product.id,
      movement_type: 'in',
      quantity: initialStock,
      note: 'Initial stock'
    }])
  }

  // Insert images
  if (imagesList.length > 0 && product) {
    const imagesToInsert = imagesList.map((url, idx) => ({
      product_id: product.id,
      image_url: url,
      sort_order: idx,
      is_primary: idx === 0
    }))
    await supabase.from('product_images').insert(imagesToInsert)
  }

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  redirect('/admin/products')
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: "Database not connected" }

  // Extract images
  const imagesRaw = formData.get('images') as string
  const imagesList = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : []

  const data = {
    sku: formData.get('sku') as string,
    slug: formData.get('slug') as string,
    name: formData.get('name') as string,
    brand_id: formData.get('brand_id') as string || null,
    category_id: formData.get('category_id') as string || null,
    scale: formData.get('scale') as string,
    condition: formData.get('condition') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    status: formData.get('status') as string || 'Active',
  }

  // Update product
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) return { error: error.message }

  // Fetch old images to detect removals
  const { data: oldImages } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id)

  const oldUrls = (oldImages || []).map(img => img.image_url).filter(Boolean)

  // Cleanup removed image files from server
  await cleanupRemovedImages(oldUrls, imagesList)

  // Re-sync images in database (delete and insert)
  await supabase.from('product_images').delete().eq('product_id', id)
  if (imagesList.length > 0) {
    const imagesToInsert = imagesList.map((url, idx) => ({
      product_id: id,
      image_url: url,
      sort_order: idx,
      is_primary: idx === 0
    }))
    await supabase.from('product_images').insert(imagesToInsert)
  }

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  redirect('/admin/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  if (!supabase) return

  // Fetch product images to delete files
  const { data: images } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id)

  // Delete image files from server
  if (images && images.length > 0) {
    await deleteImageFiles(images.map(img => img.image_url))
  }

  // Cascade delete handles images and stock movements
  await supabase.from('products').delete().eq('id', id)

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  redirect('/admin/products')
}
