import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { formatIDR } from '@/lib/catalog'

const labels={available:'Tersedia',reserved:'Sedang dipesan',sold:'Terjual',draft:'Draft',archived:'Diarsipkan'}
export function ProductCard({product}: {product:Product}) { const price=product.promoPrice??product.price; return <article className="card"><Link href={`/products/${product.slug}`}><div style={{position:'relative',aspectRatio:'4 / 5',background:'var(--blue-soft)'}}><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw" style={{objectFit:'cover'}}/>{product.status!=='available'&&<span style={{position:'absolute',top:10,left:10,background:'var(--cream)',padding:'4px 8px',borderRadius:99,fontSize:12,fontWeight:700}}>{labels[product.status]}</span>}</div><div style={{padding:14}}><p className="eyebrow" style={{margin:'0 0 4px'}}>{product.code} · {product.condition.replace('_',' ')}</p><h3 style={{fontSize:'1rem',margin:'0 0 6px'}}>{product.name}</h3><p style={{margin:0,fontWeight:800}}>{product.promoPrice&&<><s style={{color:'var(--muted)',fontWeight:500,fontSize:'.8rem',marginRight:6}}>{formatIDR(product.price)}</s></>}{formatIDR(price)}</p></div></Link></article> }
