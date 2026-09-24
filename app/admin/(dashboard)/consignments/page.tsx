import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'

// Monitoring Titip Jual — daftar pengajuan jastip dari Supabase.
export const dynamic = 'force-dynamic'

type Row = {
  id: string
  seller_name: string
  seller_whatsapp: string
  product_name: string
  condition: string
  requested_net_price_idr: number
  status: string
  created_at: string
  categories: { name: string } | null
  consignment_request_images: { storage_path: string }[]
}

const STATUS: Record<string, string> = {
  pending: 'Baru', reviewing: 'Ditinjau', approved: 'Disetujui', published: 'Tayang',
  rejected: 'Ditolak', withdrawn: 'Ditarik', sold: 'Terjual', settled: 'Selesai',
}
const COND: Record<string, string> = { like_new: 'Like new', very_good: 'Sangat baik', good: 'Baik', fair: 'Layak' }

async function getRows(): Promise<Row[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('consignment_requests')
    .select('id,seller_name,seller_whatsapp,product_name,condition,requested_net_price_idr,status,created_at,categories(name),consignment_request_images(storage_path)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return null
  return data as unknown as Row[]
}

export default async function Consignments() {
  const rows = await getRows()
  return (
    <main className="shell section">
      <p className="eyebrow">Admin</p>
      <h1 style={{ margin: '4px 0' }}>Titip Jual</h1>
      <p style={{ color: 'var(--muted)' }}>Pengajuan dari halaman /titip-jual. Hubungi penjual via WhatsApp; ubah status di database setelah review.</p>
      {rows === null ? (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <p style={{ margin: 0 }}>Gagal memuat. Periksa koneksi Supabase.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <p style={{ margin: 0 }}>Belum ada pengajuan Titip Jual.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '10px 12px' }}>Masuk</th>
                <th style={{ padding: '10px 12px' }}>Penjual</th>
                <th style={{ padding: '10px 12px' }}>Barang</th>
                <th style={{ padding: '10px 12px' }}>Harga bersih diminta</th>
                <th style={{ padding: '10px 12px' }}>Foto</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                    {r.seller_name}
                    <div style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.85rem' }}>
                      <a href={`https://wa.me/${r.seller_whatsapp}`} target="_blank" rel="noreferrer">{r.seller_whatsapp}</a>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {r.product_name}
                    <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                      {r.categories?.name ?? '—'} · {COND[r.condition] ?? r.condition}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatIDR(r.requested_net_price_idr)}</td>
                  <td style={{ padding: '10px 12px' }}>{r.consignment_request_images.length} file</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="stock-badge stock-badge-available" style={{ fontSize: '.8rem' }}>{STATUS[r.status] ?? r.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}><Link href={`/admin/consignments/${r.id}`}>Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
