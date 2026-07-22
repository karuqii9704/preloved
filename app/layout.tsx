import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Preloved | Barang pilihan, proses yang jelas',
  description: 'Storefront preloved dengan kondisi barang, kode produk, dan pemesanan lewat WhatsApp.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>
}
