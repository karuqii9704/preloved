import { createClient } from '@supabase/supabase-js'
import ProductForm from './product-form'

// Halaman tambah produk: server fetch kategori aktif → form client.
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let categories: { id: string; name: string }[] = []
  if (url && key) {
    const admin = createClient(url, key, { auth: { persistSession: false } })
    const { data } = await admin.from('categories').select('id,name').eq('is_active', true).order('sort_order')
    categories = data ?? []
  }
  return <ProductForm categories={categories} />
}
