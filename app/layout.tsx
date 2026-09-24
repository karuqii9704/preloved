import type { Metadata } from 'next'
import './globals.css'
import { CsWidget } from '@/components/cs-widget'
import { RouteProgress } from '@/components/route-progress'
import { StoreSettingsProvider } from '@/components/store-settings-context'

export const metadata: Metadata = {
  title: 'Preloved | Barang pilihan, proses yang jelas',
  description: 'Storefront preloved dengan kondisi barang, kode produk, dan pemesanan lewat WhatsApp.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><RouteProgress /><StoreSettingsProvider>{children}<CsWidget /></StoreSettingsProvider></body></html>
}
