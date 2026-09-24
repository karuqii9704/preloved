'use client'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export function AdminNav() {
  const router = useRouter()
  async function logout() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      const supabase = createBrowserClient(url, key)
      await supabase.auth.signOut()
    }
    router.replace('/admin/login')
    router.refresh()
  }
  return (
    <nav aria-label="Navigasi admin" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 16 }}>
      <Link href="/admin" style={{ fontWeight: 800 }}>Ringkasan</Link>
      <Link href="/admin/products">Produk</Link>
      <Link href="/admin/slides">Slides</Link>
      <Link href="/admin/offers">Offers</Link>
      <Link href="/admin/categories">Kategori</Link>
      <Link href="/admin/consignments">Titip Jual</Link>
      <Link href="/admin/orders">Inquiry</Link>
      <Link href="/admin/settings">Pengaturan</Link>
      <button type="button" onClick={logout} className="btn btn-secondary" style={{ marginLeft: 'auto', minHeight: 38, padding: '.4rem .9rem', fontSize: '.85rem' }}>Keluar</button>
    </nav>
  )
}
