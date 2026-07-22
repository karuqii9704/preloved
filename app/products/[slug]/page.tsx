import { notFound } from 'next/navigation'
import Image from 'next/image'
import { StoreShell } from '@/components/store-shell'
import { AddToCart } from '@/components/add-to-cart'
import { bySlug, formatIDR } from '@/lib/catalog'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = bySlug((await params).slug)
  if (!product) return notFound()

  const available = product.status === 'available'

  return (
    <StoreShell>
      <section className="shell section product-detail">
        <div className="product-detail-media">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width:700px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="product-detail-info">
          <p className="eyebrow">{product.code} · {product.category}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <p style={{ fontWeight: 850, fontSize: '1.32rem', margin: '0 0 .25rem' }}>
            {formatIDR(product.promoPrice ?? product.price)}
          </p>
          <div className="product-condition">
            <p><strong>Kondisi:</strong> {product.condition.replace('_', ' ')}</p>
            <p className={`stock-badge ${available ? 'stock-badge-available' : 'stock-badge-unavailable'}`} role="status">
              <span aria-hidden="true" />
              {available ? 'Tersedia' : 'Sedang tidak tersedia'}
            </p>
          </div>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>{product.shortDescription}</p>
          <div className="product-description-panel">
            <p style={{ margin: 0 }}>{product.description}</p>
          </div>
          <div style={{ marginTop: 18 }}>
            <AddToCart product={product} />
          </div>
        </div>
      </section>
    </StoreShell>
  )
}
