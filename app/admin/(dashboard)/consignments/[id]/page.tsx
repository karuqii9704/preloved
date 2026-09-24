import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { formatIDR } from '@/lib/catalog'

// Detail pengajuan Titip Jual + foto dari bucket private (signed URL).
export const dynamic = 'force-dynamic'

const STATUS: Record<string, string> = {
  pending: 'Baru', reviewing: 'Ditinjau', approved: 'Disetujui', published: 'Tayang',
  rejected: 'Ditolak', withdrawn: 'Ditarik', sold: 'Terjual', settled: 'Selesai',
}
const COND: Record<string, string> = { like_new: 'Like new', very_good: 'Sangat baik', good: 'Baik', fair: 'Layak' }

async function getDetail(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data: row } = await admin
    .from('consignment_requests')
    .select('*,categories(name)')
    .eq('id', id)
    .maybeSingle()
  if (!row) return null
  const { data: imgs } = await admin
    .from('consignment_request_images')
    .select('storage_path,sort_order')
    .eq('request_id', id)
    .order('sort_order')
  const photos: string[] = []
  for (const img of imgs ?? []) {
    const { data: signed } = await admin.storage.from('consignment-private').createSignedUrl(img.storage_path, 3600)
    if (signed?.signedUrl) photos.push(signed.signedUrl)
  }
  return { row, photos }
}

export default async function ConsignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const data = await getDetail((await params).id)
  if (!data) notFound()
  const { row, photos } = data

  const rows: [string, React.ReactNode][] = [
    ['Status', STATUS[row.status] ?? row.status],
    ['Penjual', row.seller_name],
    ['WhatsApp', <a key="wa" href={`https://wa.me/${row.seller_whatsapp}`} target="_blank" rel="noreferrer">{row.seller_whatsapp}</a>],
    ['Email', row.seller_email ?? '—'],
    ['Barang', row.product_name],
    ['Kategori', row.categories?.name ?? '—'],
    ['Kondisi', COND[row.condition] ?? row.condition],
    ['Harga bersih diminta', formatIDR(row.requested_net_price_idr)],
    ['Usulan harga jual', row.proposed_sale_price_idr ? formatIDR(row.proposed_sale_price_idr) : '—'],
    ['Masuk', new Date(row.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })],
  ]

  return (
    <main className="shell section" style={{ maxWidth: 820 }}>
      <p className="eyebrow">Admin</p>
      <h1 style={{ margin: '4px 0' }}>Review Titip Jual</h1>
      <p><Link href="/admin/consignments">← Kembali ke daftar</Link></p>
      <div className="card" style={{ padding: 20, marginTop: 12 }}>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px 24px', margin: 0 }}>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{k}</dt>
              <dd style={{ margin: '2px 0 0', fontWeight: 600 }}>{v}</dd>
            </div>
          ))}
        </dl>
        <h2 style={{ fontSize: '1rem', marginBottom: 4 }}>Deskripsi penjual</h2>
        <p style={{ whiteSpace: 'pre-line', margin: 0, color: 'var(--muted)' }}>{row.description}</p>
      </div>
      <h2 style={{ marginTop: 28 }}>Foto ({photos.length})</h2>
      {photos.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }} />
          ))}
        </div>
      ) : <p style={{ color: 'var(--muted)' }}>Tidak ada foto.</p>}
      {row.admin_feedback && <><h2>Catatan admin</h2><p>{row.admin_feedback}</p></>}
    </main>
  )
}
