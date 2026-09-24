import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'
import { AdminEmpty } from '@/components/admin-empty'

// Monitoring inquiry WhatsApp — tercatat otomatis saat pembeli checkout.
export const dynamic = 'force-dynamic'

type Inquiry = {
  id: string
  buyer_name: string
  buyer_address: string
  subtotal_idr: number
  status: string
  created_at: string
}

async function getInquiries(): Promise<Inquiry[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('order_inquiries')
    .select('id,buyer_name,buyer_address,subtotal_idr,status,created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return null
  return data as Inquiry[]
}

const STATUS_LABEL: Record<string, string> = {
  inquiry: 'Inquiry', confirmed: 'Dikonfirmasi', shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Batal',
}

export default async function Orders() {
  const rows = await getInquiries()
  return (
    <main className="shell section">
      
      <p className="eyebrow">Admin</p>
      <h1 style={{ margin: '4px 0' }}>Inquiry WhatsApp</h1>
      <p style={{ color: 'var(--muted)' }}>Tercatat otomatis tiap checkout. Tindaklanjuti lewat WhatsApp; status diubah manual di database.</p>
      {rows === null ? (
        <AdminEmpty title="Gagal memuat inquiry" body="Periksa koneksi Supabase." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada inquiry" body="Inquiry tercatat otomatis saat pembeli menekan tombol pesanan di halaman keranjang." />
      ) : (
        <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Waktu</th><th>Pembeli</th><th>Detail</th><th>Subtotal</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.buyer_name}</td>
                  <td style={{ whiteSpace: 'pre-line', color: 'var(--muted)', fontSize: '.88rem' }}>{r.buyer_address}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatIDR(r.subtotal_idr)}</td>
                  <td><span className={`pill ${r.status === 'inquiry' ? 'pill-mute' : r.status === 'cancelled' ? 'pill-off' : 'pill-ok'}`}>{STATUS_LABEL[r.status] ?? r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
