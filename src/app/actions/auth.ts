'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) {
    return { error: 'Authentication is not configured.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  // Admin login is role-gated: reject non-admin accounts.
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }

  redirect('/admin/login')
}
