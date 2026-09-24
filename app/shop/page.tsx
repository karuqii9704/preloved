import { StoreShell } from '@/components/store-shell'
import { ShopBrowser } from '@/components/shop-browser'
import { getActiveProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function Shop() {
  const products = await getActiveProducts()
  return (
    <StoreShell>
      <section className="shell section">
        <p className="eyebrow">Katalog</p>
        <h1 className="page-title">Temukan yang pas.</h1>
        <ShopBrowser products={products} />
      </section>
    </StoreShell>
  )
}
