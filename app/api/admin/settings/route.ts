import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// API admin pengaturan toko (WA/IG/FB). Dilindungi middleware /admin.
const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY

const settingsSchema = z.object({
  store_name: z.string().trim().min(2).max(60),
  whatsapp_number: z.string().regex(/^[0-9]{8,16}$/, 'Nomor WhatsApp harus 8-16 digit.'),
  instagram_url: z.string().url().max(200).nullable().or(z.literal('')),
  facebook_url: z.string().url().max(200).nullable().or(z.literal('')),
  contact_note: z.string().max(300).nullable().or(z.literal('')),
})

function adminClient() {
  if (!url() || !serviceKey()) return null
  return createClient(url()!, serviceKey()!, { auth: { persistSession: false } })
}

export async function GET() {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 })
  const { data, error } = await admin.from('store_settings').select('*').eq('id', true).maybeSingle()
  if (error) return NextResponse.json({ error: 'Gagal memuat pengaturan.' }, { status: 500 })
  return NextResponse.json(data ?? {
    store_name: 'preloved.', whatsapp_number: '', instagram_url: null, facebook_url: null, contact_note: null,
  })
}

export async function PUT(request: Request) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Body harus JSON.' }, { status: 400 }) }
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 })
  }
  const d = parsed.data
  const { error } = await admin.from('store_settings').upsert({
    id: true,
    store_name: d.store_name,
    whatsapp_number: d.whatsapp_number,
    instagram_url: d.instagram_url || null,
    facebook_url: d.facebook_url || null,
    contact_note: d.contact_note || null,
    updated_at: new Date().toISOString(),
  })
  if (error) return NextResponse.json({ error: 'Gagal menyimpan pengaturan.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
