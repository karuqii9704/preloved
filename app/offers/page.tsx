import { StoreShell } from '@/components/store-shell'; import { ProductCard } from '@/components/product-card'; import { getActiveProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export default async function Offers(){const offers=(await getActiveProducts()).filter(p=>p.promoPrice);return <StoreShell><section className="shell section"><p className="eyebrow">Harga khusus</p><h1 className="page-title">Offers</h1>{offers.length?<div className="grid">{offers.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p>Belum ada penawaran aktif.</p>}</section></StoreShell>}