// Katalog produk — sumber utama Supabase (server-side fetch per request).
// Fallback ke dummy hanya bila Supabase belum terkonfigurasi / tabel kosong.
import { cache } from 'react'
import { Product } from './types'

const DUMMY: Product[] = [
  { id:'1', code:'PLV-0001', slug:'cardigan-rajut-biru', name:'Cardigan Rajut Biru', category:'Pakaian', price:185000, condition:'very_good', status:'available', shortDescription:'Rajut lembut, jatuh rapi.', description:'Cardigan rajut warna biru muda. Kondisi sangat baik, tanpa noda atau sobek.', image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', featured:true },
  { id:'2', code:'PLV-0002', slug:'tas-kulit-klasik', name:'Tas Kulit Klasik', category:'Aksesori', price:325000, promoPrice:279000, condition:'good', status:'available', shortDescription:'Tas tangan kulit dengan patina cantik.', description:'Tas kulit klasik dengan kompartemen utama dan tali pendek. Ada tanda pakai wajar di sudut.', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', featured:true },
  { id:'3', code:'PLV-0003', slug:'kemeja-linen-putih', name:'Kemeja Linen Putih', category:'Pakaian', price:145000, condition:'like_new', status:'available', shortDescription:'Linen ringan untuk hari cerah.', description:'Kemeja linen putih dengan siluet rileks. Dipakai kurang dari tiga kali.', image:'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=80' },
  { id:'4', code:'PLV-0004', slug:'sepatu-loafer-cokelat', name:'Sepatu Loafer Cokelat', category:'Sepatu', price:220000, condition:'good', status:'reserved', shortDescription:'Loafer nyaman dengan sol kuat.', description:'Sepatu loafer cokelat ukuran 38. Ada sedikit lipatan pemakaian pada bagian depan.', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
]

type Row = {
  id: string; product_code: string; slug: string; name: string; price_idr: number
  description_short: string; description: string; condition: Product['condition']
  status: Product['status']; is_highlighted: boolean
  categories: { name: string } | null
  product_images: { storage_path: string }[]
  offer_products: { promo_price_idr: number | null; offers: { is_active: boolean; starts_at: string | null; ends_at: string | null } | null }[]
}

function mapRow(r: Row): Product {
  const now = Date.now()
  const promo = r.offer_products
    .filter((op) => op.promo_price_idr != null && op.offers?.is_active)
    .filter((op) => {
      const o = op.offers!
      return (!o.starts_at || new Date(o.starts_at).getTime() <= now) && (!o.ends_at || new Date(o.ends_at).getTime() >= now)
    })
    .map((op) => op.promo_price_idr!)
    .sort((a, b) => a - b)[0]
  const img = [...r.product_images].sort((a, b) => 0)[0] // urutan sudah di-query order=sort_order
  return {
    id: r.id, code: r.product_code, slug: r.slug, name: r.name,
    category: r.categories?.name ?? 'Lainnya',
    price: r.price_idr, promoPrice: promo,
    condition: r.condition, status: r.status,
    shortDescription: r.description_short, description: r.description,
    image: img?.storage_path ?? '/images/placeholder.png',
    featured: r.is_highlighted,
  }
}

const SELECT = 'id,product_code,slug,name,price_idr,description_short,description,condition,status,is_highlighted,categories(name),product_images(storage_path),offer_products(promo_price_idr,offers(is_active,starts_at,ends_at))'

/** Semua produk yang boleh tampil publik (available/reserved/sold, sudah published).
 *  Pakai service role: server-only, dan offer_products tidak punya policy public
 *  (RLS deny) sehingga harga promo hanya terbaca lewat key ini. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return DUMMY
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await sb.from('products')
      .select(SELECT)
      .in('status', ['available', 'reserved', 'sold'])
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
    if (error || !data || data.length === 0) return DUMMY
    return (data as unknown as Row[]).map(mapRow)
  } catch {
    return DUMMY
  }
})

export const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

export const getActiveProducts = async () => (await getProducts()).filter((p) => p.status === 'available')
export const getBySlug = async (slug: string) => (await getProducts()).find((p) => p.slug === slug)
