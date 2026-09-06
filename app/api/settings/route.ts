import { NextResponse } from 'next/server'
import { getStoreSettings, DEFAULT_SETTINGS } from '@/lib/store-settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS, { headers: { 'Cache-Control': 'no-store' } })
  }
}
