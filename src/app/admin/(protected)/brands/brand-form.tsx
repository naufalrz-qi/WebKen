'use client'

import { useActionState, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrand, updateBrand } from "@/app/actions/taxonomy"
import { Spinner } from "@phosphor-icons/react/dist/ssr"

export function BrandForm({ brand, onCancel }: { brand?: any, onCancel?: () => void }) {
  const action = brand ? updateBrand.bind(null, brand.id) : createBrand
  const [state, formAction, pending] = useActionState(action, null)
  
  const [logoUrl, setLogoUrl] = useState(brand?.logo_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [slug, setSlug] = useState(brand?.slug || '')

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!brand) {
      setSlug(generateSlug(e.target.value))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      setLogoUrl(data.urls[0])
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-left text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Brand Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={brand?.name || ''} 
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
          <Label htmlFor="logo_upload">Logo Image (Will be converted to WebP)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input 
                id="logo_upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="bg-surface-1 cursor-pointer" 
              />
              <Input type="hidden" name="logo_url" value={logoUrl} />
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="animate-spin h-5 w-5" /> Uploading...
              </div>
            )}
          </div>
          
          {uploadError && (
            <p className="text-xs text-destructive mt-1">{uploadError}</p>
          )}

          {logoUrl && !isUploading && (
            <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-md border border-border bg-surface-2 p-4">
              <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => window.history.back())}>Cancel</Button>
        <Button type="submit" disabled={pending || isUploading}>
          {pending ? "Saving..." : (brand ? "Update Brand" : "Create Brand")}
        </Button>
      </div>
    </form>
  )
}
