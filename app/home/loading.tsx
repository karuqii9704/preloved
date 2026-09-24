// Loading homepage — hero + grid skeleton.
export default function HomeLoading() {
  return (
    <>
      <section className="shell home-hero-section" aria-busy="true">
        <div className="home-hero">
          <div className="hero-copy">
            <div className="skeleton" style={{ width: 150, height: 26, borderRadius: 99 }} />
            <div className="skeleton" style={{ width: '86%', height: 54, marginTop: 20 }} />
            <div className="skeleton" style={{ width: '64%', height: 54, marginTop: 10 }} />
            <div className="skeleton" style={{ width: '70%', height: 14, marginTop: 22 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <div className="skeleton" style={{ width: 150, height: 46, borderRadius: 999 }} />
              <div className="skeleton" style={{ width: 160, height: 46, borderRadius: 999 }} />
            </div>
          </div>
          <div className="skeleton" style={{ minHeight: 360, borderRadius: 0 }} />
        </div>
      </section>
      <section className="shell section" style={{ paddingTop: 0 }}>
        <div className="grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="card" key={i}>
              <div className="skeleton" style={{ aspectRatio: '4/5', borderRadius: 0 }} />
              <div className="product-card-body">
                <div className="skeleton" style={{ width: '40%', height: 10 }} />
                <div className="skeleton" style={{ width: '80%', height: 17 }} />
                <div className="skeleton" style={{ width: '50%', height: 15 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
