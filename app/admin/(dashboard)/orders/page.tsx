import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'

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
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <p style={{ margin: 0 }}>Gagal memuat. Periksa koneksi Supabase.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <p style={{ margin: 0 }}>Belum ada inquiry masuk.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '10px 12px' }}>Waktu</th>
                <th style={{ padding: '10px 12px' }}>Pembeli</th>
                <th style={{ padding: '10px 12px' }}>Detail</th>
                <th style={{ padding: '10px 12px' }}>Subtotal</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{r.buyer_name}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'pre-line', color: 'var(--muted)', fontSize: '.9rem' }}>{r.buyer_address}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatIDR(r.subtotal_idr)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="stock-badge stock-badge-available" style={{ fontSize: '.8rem' }}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
