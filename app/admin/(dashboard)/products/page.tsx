import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'
import { AdminEmpty } from '@/components/admin-empty'

// Daftar produk — dibaca langsung dari Supabase (service role).
export const dynamic = 'force-dynamic'

type Row = {
  id: string; product_code: string; slug: string; name: string; price_idr: number
  condition: string; status: string; is_highlighted: boolean; created_at: string
  categories: { name: string } | null
  product_images: { storage_path: string }[]
  offer_products: { promo_price_idr: number | null }[]
}

const STATUS: Record<string, { label: string; cls: string }> = {
  available: { label: 'Tersedia', cls: 'pill-ok' },
  reserved: { label: 'Dipesan', cls: 'pill-warn' },
  sold: { label: 'Terjual', cls: 'pill-off' },
  draft: { label: 'Draft', cls: 'pill-mute' },
  archived: { label: 'Arsip', cls: 'pill-off' },
}
const COND: Record<string, string> = { like_new: 'Like new', very_good: 'Sangat baik', good: 'Baik', fair: 'Layak' }

async function getProductRows(): Promise<Row[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('products')
    .select('id,product_code,slug,name,price_idr,condition,status,is_highlighted,created_at,categories(name),product_images(storage_path),offer_products(promo_price_idr)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return null
  return data as unknown as Row[]
}

export default async function ProductsAdmin() {
  const rows = await getProductRows()
  return (
    <main className="shell section">
      <div className="admin-head motion-in">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ margin: '4px 0' }}>Produk</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Kelola katalog, status, foto, dan produk unggulan.</p>
        </div>
        <Link href="/admin/products/new" className="btn">Tambah produk</Link>
      </div>

      {rows === null ? (
        <AdminEmpty title="Gagal memuat produk" body="Periksa koneksi Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada produk" body="Tambahkan produk pertama untuk menampilkannya di storefront." action={{ href: '/admin/products/new', label: 'Tambah produk' }} />
      ) : (
        <div className="admin-scroll motion-in-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto</th><th>Produk</th><th>Harga</th><th>Kondisi</th><th>Status</th><th>Highlight</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS[r.status] ?? { label: r.status, cls: 'pill-off' }
                const promo = r.offer_products.map((o) => o.promo_price_idr).filter((v): v is number => v != null).sort((a, b) => a - b)[0]
                const img = r.product_images[0]?.storage_path
                return (
                  <tr key={r.id}>
                    <td style={{ width: 68 }}>
                      {img ? (
                        <Image className="admin-thumb" src={img} alt={r.name} width={52} height={52} />
                      ) : (
                        <div className="admin-thumb" aria-hidden="true" />
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/products/${r.id}`} style={{ fontWeight: 750 }}>{r.name}</Link>
                      <div className="admin-sub">{r.product_code} · {r.categories?.name ?? 'Tanpa kategori'}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {promo != null ? (
                        <>
                          <s style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{formatIDR(r.price_idr)}</s>
                          <div style={{ fontWeight: 800, color: '#155b3b' }}>{formatIDR(promo)}</div>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700 }}>{formatIDR(r.price_idr)}</span>
                      )}
                    </td>
                    <td>{COND[r.condition] ?? r.condition}</td>
                    <td><span className={`pill ${st.cls}`}>{st.label}</span></td>
                    <td>{r.is_highlighted ? <span className="pill pill-ok">Ya</span> : <span className="admin-sub">—</span>}</td>
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
