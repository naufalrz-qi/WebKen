import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  
  // Return null or a dummy client if not configured so the app doesn't crash during mock mode
  if (!supabaseUrl || supabaseUrl === 'your-project-url') {
    return null as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
