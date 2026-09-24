import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Dashboard admin — statistik toko langsung dari Supabase.
export const dynamic = 'force-dynamic'
async function getStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const [available, reserved, sold, consignments, inquiries] = await Promise.all([
    admin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'available'),
    admin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'reserved'),
    admin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    admin.from('consignment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('order_inquiries').select('id', { count: 'exact', head: true }),
  ])
  return {
    available: available.count ?? 0,
    reserved: reserved.count ?? 0,
    sold: sold.count ?? 0,
    consignments: consignments.count ?? 0,
    inquiries: inquiries.count ?? 0,
  }
}

export default async function Admin() {
  const stats = await getStats()
  const cards = stats
    ? [
        ['Tersedia', stats.available], ['Sedang dipesan', stats.reserved], ['Terjual', stats.sold],
        ['Titip Jual baru', stats.consignments], ['Total inquiry', stats.inquiries],
      ]
    : [['Tersedia', '—'], ['Sedang dipesan', '—'], ['Terjual', '—'], ['Titip Jual baru', '—'], ['Total inquiry', '—']]

  return (
    <main className="shell section">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ margin: 0 }}>Ringkasan toko</h1>
          {!stats && <p className="error" style={{ margin: '6px 0 0' }}>Supabase belum terhubung — angka akan tampil setelah env diisi.</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-secondary">Lihat toko</Link>
          <Link href="/admin/settings" className="btn">Pengaturan kontak</Link>
        </div>
      </header>
      <div className="grid" style={{ marginTop: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        {cards.map(([name, value]) => (
          <div className="card" style={{ padding: 18 }} key={name as string}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>{name}</p>
            <strong style={{ fontSize: '2rem' }}>{value}</strong>
          </div>
        ))}
      </div>
      <section style={{ marginTop: 36 }}>
        <h2>Kelola</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[['Produk', '/admin/products'], ['Slides', '/admin/slides'], ['Offers', '/admin/offers'], ['Kategori', '/admin/categories'], ['Titip Jual', '/admin/consignments'], ['Inquiry', '/admin/orders'], ['Pengaturan', '/admin/settings']].map(([name, href]) => (
            <Link key={href} className="btn btn-secondary" href={href}>{name}</Link>
          ))}
        </div>
      </section>
    </main>
  )
}
