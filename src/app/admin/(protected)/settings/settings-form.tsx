'use client'

import { useActionState, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSiteSettings, updatePageSection } from "@/app/actions/settings"

export function SettingsForm({ settings }: { settings?: any }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md border border-success/20 bg-success/10 p-3 text-sm text-success">{state.success}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input id="site_name" name="site_name" defaultValue={settings?.site_name || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number (incl. country code)</Label>
          <Input id="whatsapp_number" name="whatsapp_number" defaultValue={settings?.whatsapp_number || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo_title">SEO Title</Label>
          <Input id="seo_title" name="seo_title" defaultValue={settings?.seo_title || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={settings?.contact_email || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={settings?.address || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="seo_description">SEO Description</Label>
          <Textarea id="seo_description" name="seo_description" defaultValue={settings?.seo_description || ''} className="bg-surface-1 min-h-[80px]" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bank_info">Payment / Bank Info (shown on order confirmation)</Label>
          <Textarea id="bank_info" name="bank_info" defaultValue={settings?.bank_info || ''} className="bg-surface-1 min-h-[80px]" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Settings"}</Button>
      </div>
    </form>
  )
}

export function PageSectionForm({ sectionKey, section }: { sectionKey: string, section?: any }) {
  const action = updatePageSection.bind(null, sectionKey)
  const [state, formAction, pending] = useActionState(action, null)
  const [imageUrl, setImageUrl] = useState(section?.image_url || '')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', sectionKey)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.urls?.[0]) setImageUrl(data.urls[0])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md border border-success/20 bg-success/10 p-3 text-sm text-success">{state.success}</div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`title-${sectionKey}`}>Title / Headline</Label>
          <Input id={`title-${sectionKey}`} name="title" defaultValue={section?.title || ''} required className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`subtitle-${sectionKey}`}>Subtitle / Short Description</Label>
          <Input id={`subtitle-${sectionKey}`} name="subtitle" defaultValue={section?.subtitle || ''} className="bg-surface-1" />
        </div>
        <div className="space-y-2">
          <Label>Image (Optional)</Label>
          <div className="flex gap-2">
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="bg-surface-1" />
            {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
          </div>
          <p className="text-xs text-muted-foreground">Atau masukkan URL manual:</p>
          <Input
            id={`image_url-${sectionKey}`}
            name="image_url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.currentTarget.value)}
            className="bg-surface-1"
          />
          {imageUrl && <p className="text-xs text-muted-foreground">Current: {imageUrl}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`content-${sectionKey}`}>Page Content (Markdown / Text)</Label>
          <Textarea id={`content-${sectionKey}`} name="content" defaultValue={section?.content || ''} required className="bg-surface-1 min-h-[200px]" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Content"}</Button>
      </div>
    </form>
  )
}
