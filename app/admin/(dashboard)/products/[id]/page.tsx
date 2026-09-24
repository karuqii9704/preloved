import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import EditProduct from './edit-form'

// Wrapper server: ambil satu produk dari Supabase → form client.
export const dynamic = 'force-dynamic'

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) notFound()
  const admin = createClient(url, key, { auth: { persistSession: false } })

  const { data: product } = await admin.from('products')
    .select('id,product_code,slug,name,price_idr,condition,status,is_highlighted,description_short,description,published_at,categories(id,name)')
    .eq('id', id).maybeSingle()
  if (!product) notFound()

  const { data: images } = await admin.from('product_images')
    .select('id,storage_path,alt_text,sort_order').eq('product_id', id).order('sort_order')
  const { data: categories } = await admin.from('categories').select('id,name').eq('is_active', true).order('sort_order')

  return <EditProduct product={JSON.parse(JSON.stringify(product))} images={JSON.parse(JSON.stringify(images ?? []))} categories={JSON.parse(JSON.stringify(categories ?? []))} />
}
