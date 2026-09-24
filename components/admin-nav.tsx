'use client'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS: [string, string][] = [
  ['Ringkasan', '/admin'],
  ['Produk', '/admin/products'],
  ['Slides', '/admin/slides'],
  ['Offers', '/admin/offers'],
  ['Kategori', '/admin/categories'],
  ['Titip Jual', '/admin/consignments'],
  ['Inquiry', '/admin/orders'],
  ['Pengaturan', '/admin/settings'],
]

export function AdminNav() {
  const pathname = usePathname()

  async function logout() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      const supabase = createBrowserClient(url, key)
      await supabase.auth.signOut()
    }
    window.location.assign('/admin/login')
  }

  return (
    <nav aria-label="Navigasi admin" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginTop: 16 }}>
      {ITEMS.map(([name, href]) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            style={{
              padding: '.45rem .8rem', borderRadius: 999, fontWeight: active ? 800 : 600, fontSize: '.9rem',
              background: active ? 'var(--ink)' : 'transparent', color: active ? 'white' : 'inherit',
              border: '1px solid ' + (active ? 'var(--ink)' : 'transparent'),
            }}>
            {name}
          </Link>
        )
      })}
      <button type="button" onClick={logout} className="btn btn-secondary" style={{ marginLeft: 'auto', minHeight: 38, padding: '.4rem .9rem', fontSize: '.85rem' }}>Keluar</button>
    </nav>
  )
}
