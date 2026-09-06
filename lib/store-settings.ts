// Pengaturan toko (WA/IG/FB) — dibaca dari Supabase bila terhubung,
// fallback ke default agar storefront tetap hidup tanpa DB.
import { createClient } from '@supabase/supabase-js'

export type StoreSettings = {
  store_name: string
  whatsapp_number: string
  instagram_url: string | null
  facebook_url: string | null
  contact_note: string | null
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'preloved.',
  whatsapp_number: '6285123071588',
  instagram_url: null,
  facebook_url: null,
  contact_note: null,
}

export const FALLBACK_WA = '6285123071588'

let cache: StoreSettings | null = null

/** Ambil pengaturan (server-side). Unstable cache per request; jangan di-cache antar-request. */
export async function getStoreSettings(): Promise<StoreSettings> {
  if (cache) return cache
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return DEFAULT_SETTINGS
  try {
    const admin = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await admin.from('store_settings').select('store_name,whatsapp_number,instagram_url,facebook_url,contact_note').eq('id', true).maybeSingle()
    if (error || !data) return DEFAULT_SETTINGS
    cache = data as StoreSettings
    return cache
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Untuk client: fetch /api/settings — dipakai via context provider. */
export const clientSettingsUrl = '/api/settings'
