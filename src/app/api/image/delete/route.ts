import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'images'

export async function POST(req: NextRequest) {
  try {
    // Enforce admin authentication
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const imageUrl = body.imageUrl as string

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    // Extract file path from Supabase Storage public URL
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const idx = imageUrl.indexOf(marker)

    if (idx === -1) {
      // Not a Supabase Storage URL — nothing to delete
      return NextResponse.json({ success: true })
    }

    const filePath = imageUrl.slice(idx + marker.length)
    if (!filePath || filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    // Delete file from Supabase Storage
    const { error } = await supabase.storage.from(BUCKET).remove([filePath])
    if (error) {
      console.error('Storage delete error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Image delete error:', error)
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 })
  }
}
