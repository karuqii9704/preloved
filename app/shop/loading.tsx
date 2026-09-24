// Loading storefront katalog — skeleton kartu saat data Supabase dimuat.
export default function ShopLoading() {
  return (
    <section className="shell section" aria-busy="true" aria-live="polite">
      <div className="skeleton" style={{ width: 68, height: 11, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: 280, height: 40, marginBottom: 26 }} />
      <div className="shop-filters">
        <div className="skeleton" style={{ height: 44, borderRadius: '.65rem' }} />
        <div className="skeleton" style={{ height: 44, width: 145, borderRadius: '.65rem' }} />
        <div className="skeleton" style={{ height: 44, width: 145, borderRadius: '.65rem' }} />
      </div>
      <div className="grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="card" key={i}>
            <div className="skeleton" style={{ aspectRatio: '4/5', borderRadius: 0 }} />
            <div className="product-card-body">
              <div className="skeleton" style={{ width: '38%', height: 10 }} />
              <div className="skeleton" style={{ width: '82%', height: 17 }} />
              <div className="skeleton" style={{ width: '55%', height: 12 }} />
              <div className="skeleton" style={{ width: '45%', height: 16 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
