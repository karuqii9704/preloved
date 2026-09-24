// Catat inquiry pesanan ke Supabase sebelum handoff WhatsApp.
// Non-blocking bagi UX: kegagalan insert TIDAK menggagalkan checkout WA.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  address: z.string().trim().min(5).max(300),
  subtotal: z.coerce.number().int().min(0),
  items: z.array(z.object({
    code: z.string().max(20),
    name: z.string().max(140),
    price: z.coerce.number().int().min(0),
  })).min(1).max(50),
})

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Body harus JSON.' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Data pesanan tidak valid.' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ ok: true, demo: true })

  const d = parsed.data
  const summary = d.items.map((it) => `[${it.code}] ${it.name}`).join(', ')
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await admin.from('order_inquiries').insert({
    buyer_name: d.name,
    buyer_address: `${d.address}\n\nBarang: ${summary}`,
    subtotal_idr: d.subtotal,
  })
  if (error) return NextResponse.json({ error: 'Inquiry belum tercatat.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
