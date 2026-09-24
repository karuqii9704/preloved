import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'
import { AdminEmpty } from '@/components/admin-empty'

// Daftar offers + produk yang ikut promo.
export const dynamic = 'force-dynamic'

type Row = {
  id: string; title: string; summary: string; discount_type: string; amount: number
  is_active: boolean; starts_at: string | null; ends_at: string | null
  offer_products: { promo_price_idr: number | null; products: { name: string; product_code: string } | null }[]
}

function window_(r: Row): { label: string; cls: string } {
  const now = Date.now()
  if (!r.is_active) return { label: 'Nonaktif', cls: 'pill-off' }
  if (r.starts_at && new Date(r.starts_at).getTime() > now) return { label: 'Terjadwal', cls: 'pill-mute' }
  if (r.ends_at && new Date(r.ends_at).getTime() < now) return { label: 'Berakhir', cls: 'pill-off' }
  return { label: 'Aktif', cls: 'pill-ok' }
}

export default async function Offers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let rows: Row[] | null = null
  if (url && key) {
    const admin = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await admin
      .from('offers')
      .select('id,title,summary,discount_type,amount,is_active,starts_at,ends_at,offer_products(promo_price_idr,products(name,product_code))')
      .order('starts_at', { ascending: false, nullsFirst: true })
      .limit(100)
    if (!error) rows = data as unknown as Row[]
  }

  return (
    <main className="shell section">
      <div className="admin-head motion-in">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ margin: '4px 0' }}>Offers</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Atur harga promo dan periode aktif. Promo aktif otomatis tampil di katalog.</p>
        </div>
      </div>
      {rows === null ? (
        <AdminEmpty title="Gagal memuat offers" body="Periksa koneksi Supabase." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada promo" body="Buat offer untuk menampilkan harga khusus di katalog." />
      ) : (
        <div className="admin-scroll motion-in-2">
          <table className="admin-table">
            <thead>
              <tr><th>Judul</th><th>Tipe</th><th>Nilai</th><th>Produk</th><th>Periode</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const w = window_(r)
                const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—'
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.title}</strong>
                      <div className="admin-sub">{r.summary}</div>
                    </td>
                    <td>{r.discount_type === 'fixed_price' ? 'Harga tetap' : 'Persentase'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {r.discount_type === 'fixed_price' ? formatIDR(r.amount) : `${r.amount}%`}
                    </td>
                    <td>
                      {r.offer_products.length === 0 ? <span className="admin-sub">—</span> : r.offer_products.map((op, i) => (
                        <div key={i} className="admin-sub" style={{ marginTop: i ? 4 : 0 }}>
                          {op.products?.name ?? 'Produk'}{' '}
                          {op.promo_price_idr != null && <strong style={{ color: '#155b3b' }}>{formatIDR(op.promo_price_idr)}</strong>}
                        </div>
                      ))}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmt(r.starts_at)} – {fmt(r.ends_at)}</td>
                    <td><span className={`pill ${w.cls}`}>{w.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
