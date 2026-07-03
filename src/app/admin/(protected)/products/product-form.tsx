'use client'

import { useActionState, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProduct, updateProduct } from "@/app/actions/products"
import { Spinner, Trash } from "@phosphor-icons/react/dist/ssr"

export function ProductForm({ product, brands = [], categories = [], onCancel }: { product?: any, brands?: any[], categories?: any[], onCancel?: () => void }) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct
  const [state, formAction, pending] = useActionState(action, null)

  const initialImages = product?.product_images?.map((img: any) => img.image_url) || []
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [slug, setSlug] = useState(product?.slug || '')

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) {
      setSlug(generateSlug(e.target.value))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError('')

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i])
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload images")
      }

      setImageUrls(prev => [...prev, ...data.urls])
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = '' // reset input
    }
  }

  const removeImage = async (indexToRemove: number) => {
    const imageToDelete = imageUrls[indexToRemove]

    // Attempt to delete file from Supabase Storage (API handles URL validation)
    if (imageToDelete) {
      try {
        await fetch('/api/image/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: imageToDelete }),
        })
      } catch (err) {
        console.error('Failed to delete image file:', err)
      }
    }

    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-left text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={product?.name || ''} 
            onChange={handleNameChange}
            required 
            className="bg-surface-1" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input 
            id="slug" 
            name="slug" 
            value={slug} 
            readOnly
            required 
            className="bg-muted cursor-not-allowed" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku || ''} required className="bg-surface-1 uppercase" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="brand_id">Brand</Label>
          <select id="brand_id" name="brand_id" defaultValue={product?.brand_id || ''} required className="flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25">
            <option value="" disabled>Select a brand...</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <select id="category_id" name="category_id" defaultValue={product?.category_id || ''} required className="flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25">
            <option value="" disabled>Select a category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scale">Scale</Label>
          <Input id="scale" name="scale" defaultValue={product?.scale || '1:64'} required className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Input id="condition" name="condition" defaultValue={product?.condition || 'Brand New in Box'} required className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (IDR)</Label>
          <Input id="price" name="price" type="number" defaultValue={product?.price || ''} required className="bg-surface-1 font-mono" />
        </div>
        
        {!product && (
          <div className="space-y-2">
            <Label htmlFor="stock">Initial Stock</Label>
            <Input id="stock" name="stock" type="number" defaultValue={0} required className="bg-surface-1" />
            <p className="text-xs text-muted-foreground">You can add more later in the Stock Ledger.</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={product?.status || 'Active'} className="flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25">
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <Label>Product Images</Label>
        
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="space-y-2 flex-1">
            <Label htmlFor="image_upload" className="text-xs text-muted-foreground">Upload Files</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="image_upload" 
                type="file" 
                multiple
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="bg-surface-1 cursor-pointer" 
              />
              
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner className="animate-spin h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="external_url" className="text-xs text-muted-foreground">Or Paste Image URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="external_url"
                type="url"
                placeholder="https://..."
                className="bg-surface-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value;
                    if (val && !imageUrls.includes(val)) {
                      setImageUrls(prev => [...prev, val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const val = input.value;
                if (val && !imageUrls.includes(val)) {
                  setImageUrls(prev => [...prev, val]);
                  input.value = '';
                }
              }}>Add</Button>
            </div>
          </div>
        </div>
        
        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}

        <Input type="hidden" name="images" value={imageUrls.join(',')} />

        {imageUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 rounded-md border border-border bg-muted/30 p-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                <img src={url} alt={`Preview ${index}`} className="max-w-full max-h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                >
                  <Trash className="w-6 h-6" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-interactive/90 text-white text-[10px] text-center font-bold py-0.5">
                    PRIMARY
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description || ''} required className="bg-surface-1 min-h-[100px]" />
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => window.history.back())}>Cancel</Button>
        <Button type="submit" disabled={pending || isUploading}>
          {pending ? "Saving..." : (product ? "Update Product" : "Create Product")}
        </Button>
      </div>
    </form>
  )
}
