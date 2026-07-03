import { createClient } from '@/lib/supabase/server'

const BUCKET = 'images'

/**
 * Extract the storage file path from a Supabase Storage public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/images/abc.webp" → "abc.webp"
 * Returns null if the URL is not a Supabase Storage URL.
 */
function extractStoragePath(imageUrl: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const idx = imageUrl.indexOf(marker)
    if (idx === -1) return null
    const filePath = imageUrl.slice(idx + marker.length)
    if (!filePath || filePath.includes('..')) return null
    return filePath
  } catch {
    return null
  }
}

/**
 * Delete an uploaded image from Supabase Storage.
 * Only deletes files hosted in the project's Supabase Storage bucket.
 * Silently ignores external URLs or already-deleted files.
 */
export async function deleteImageFile(imageUrl: string | null | undefined): Promise<boolean> {
  if (!imageUrl) return false

  const filePath = extractStoragePath(imageUrl)
  if (!filePath) return false

  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  if (error) {
    console.error(`Failed to delete image from storage: ${filePath}`, error.message)
    return false
  }
  return true
}

/**
 * Delete multiple image files from Supabase Storage.
 * Returns the count of successfully deleted files.
 */
export async function deleteImageFiles(imageUrls: (string | null | undefined)[]): Promise<number> {
  // Collect valid storage paths for batch deletion
  const paths = imageUrls
    .filter((url): url is string => !!url)
    .map(extractStoragePath)
    .filter((p): p is string => !!p)

  if (paths.length === 0) return 0

  const supabase = await createClient()
  if (!supabase) return 0

  const { data, error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) {
    console.error('Failed to batch delete images from storage:', error.message)
    return 0
  }
  return data?.length ?? 0
}

/**
 * Given old and new image URL lists, delete files that were removed.
 * Used when updating an entity's images (e.g. product image re-sync).
 */
export async function cleanupRemovedImages(
  oldUrls: string[],
  newUrls: string[]
): Promise<number> {
  const newSet = new Set(newUrls)
  const removedUrls = oldUrls.filter(url => !newSet.has(url))
  return deleteImageFiles(removedUrls)
}
