import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isApiAdmin = request.nextUrl.pathname.startsWith('/api/admin')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login'

  // Tanpa konfigurasi Supabase tidak ada cara memverifikasi identitas —
  // halaman admin tetap dikunci ke login, API admin ditolak.
  if (!url || !key) {
    if (isApiAdmin) return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 })
    if (isAdminPage) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.next({ request })
  }
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items: { name: string; value: string; options: Parameters<typeof response.cookies.set>[2] }[]) {
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()

  async function isAdmin(): Promise<boolean> {
    if (!user) return false
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    return profile?.role === 'admin'
  }

  // API admin: tolak dengan 401 JSON (bukan redirect HTML)
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 })
    }
    return response
  }

  // Halaman admin: redirect ke login
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    if (!(await isAdmin())) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
