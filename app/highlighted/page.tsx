import { StoreShell } from '@/components/store-shell'; import { ProductCard } from '@/components/product-card'; import { getActiveProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export default async function Highlighted(){const featured=(await getActiveProducts()).filter(p=>p.featured);return <StoreShell><section className="shell section"><p className="eyebrow">Pilihan kami</p><h1>Highlighted</h1>{featured.length?<div className="grid">{featured.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p>Belum ada barang highlight.</p>}</section></StoreShell>}