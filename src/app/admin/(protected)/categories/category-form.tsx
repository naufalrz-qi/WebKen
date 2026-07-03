'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory, updateCategory } from "@/app/actions/taxonomy"

export function CategoryForm({ category, onCancel }: { category?: any, onCancel?: () => void }) {
  const action = category ? updateCategory.bind(null, category.id) : createCategory
  const [state, formAction, pending] = useActionState(action, null)

  const [slug, setSlug] = useState(category?.slug || '')

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!category) {
      setSlug(generateSlug(e.target.value))
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
          <Label htmlFor="name">Category Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={category?.name || ''} 
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
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => window.history.back())}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : (category ? "Update Category" : "Create Category")}
        </Button>
      </div>
    </form>
  )
}
