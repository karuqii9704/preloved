import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'
import { AdminEmpty } from '@/components/admin-empty'

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
        <AdminEmpty title="Gagal memuat pengajuan" body="Periksa koneksi Supabase." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada pengajuan" body="Pengajuan dari halaman /titip-jual akan muncul di sini beserta foto barangnya." />
      ) : (
        <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Masuk</th><th>Penjual</th><th>Barang</th><th>Harga bersih diminta</th><th>Foto</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {r.seller_name}
                    <div className="admin-sub">
                      <a href={`https://wa.me/${r.seller_whatsapp}`} target="_blank" rel="noreferrer">{r.seller_whatsapp}</a>
                    </div>
                  </td>
                  <td>
                    {r.product_name}
                    <div className="admin-sub">
                      {r.categories?.name ?? '—'} · {COND[r.condition] ?? r.condition}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatIDR(r.requested_net_price_idr)}</td>
                  <td>{r.consignment_request_images.length} file</td>
                  <td><span className={`pill ${r.status === 'pending' ? 'pill-warn' : r.status === 'published' || r.status === 'settled' ? 'pill-ok' : r.status === 'rejected' || r.status === 'withdrawn' ? 'pill-off' : 'pill-mute'}`}>{STATUS[r.status] ?? r.status}</span></td>
                  <td><Link href={`/admin/consignments/${r.id}`} style={{ fontWeight: 700 }}>Detail →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
