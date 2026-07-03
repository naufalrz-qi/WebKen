import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Only the admin area is gated now — customers check out as guests (no login).
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const isConfigured = url && url !== 'your-project-url' && key && key !== 'your-publishable-key'
  if (!isConfigured) return supabaseResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminLogin = path === '/admin/login'
  const redirectTo = (pathname: string) => {
    const target = request.nextUrl.clone()
    target.pathname = pathname
    return NextResponse.redirect(target)
  }

  if (!user) {
    return isAdminLogin ? supabaseResponse : redirectTo('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  if (isAdminLogin) {
    return isAdmin ? redirectTo('/admin') : supabaseResponse
  }
  if (!isAdmin) return redirectTo('/')
  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
