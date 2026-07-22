import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { formatIDR } from '@/lib/catalog'

const labels={available:'Tersedia',reserved:'Sedang dipesan',sold:'Terjual',draft:'Draft',archived:'Diarsipkan'}
export function ProductCard({product}: {product:Product}) { const price=product.promoPrice??product.price; return <article className="card"><Link href={`/products/${product.slug}`} className="product-card-link"><div className="product-card-media"><Image src={product.image} alt={product.name} fill loading="eager" sizes="(max-width: 520px) 100vw, (max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw" style={{objectFit:'cover'}}/>{product.promoPrice&&<span className="promo-pill">Harga khusus</span>}{product.status!=='available'&&<span className="status-pill">{labels[product.status]}</span>}</div><div className="product-card-body"><p className="eyebrow" style={{margin:0}}>{product.code}</p><h3 className="product-card-title">{product.name}</h3><p className="product-meta"><span>{product.condition.replace('_',' ')}</span><span>{product.category}</span></p><p className="price-row">{product.promoPrice&&<s style={{color:'var(--muted)',fontWeight:500,fontSize:'.8rem'}}>{formatIDR(product.price)}</s>}{formatIDR(price)}</p></div></Link></article> }
