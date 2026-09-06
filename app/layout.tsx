import type { Metadata } from 'next'
import './globals.css'
import { CsWidget } from '@/components/cs-widget'

export const metadata: Metadata = {
  title: 'Preloved | Barang pilihan, proses yang jelas',
  description: 'Storefront preloved dengan kondisi barang, kode produk, dan pemesanan lewat WhatsApp.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}<CsWidget /></body></html>
}
