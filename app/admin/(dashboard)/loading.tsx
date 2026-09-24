// Loading skeleton halaman admin — tampil saat server fetch data Supabase.
export default function AdminLoading() {
  return (
    <main className="shell section" aria-busy="true" aria-live="polite">
      <div className="admin-head">
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: 62, height: 11, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: 200, height: 26, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 320, height: 13 }} />
        </div>
        <div className="skeleton" style={{ width: 130, height: 44, borderRadius: 999 }} />
      </div>
      <div className="admin-scroll">
        <table className="admin-table">
          <thead>
            <tr><th>Memuat…</th><th></th><th></th><th></th><th></th></tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3].map((i) => (
              <tr key={i} className="skeleton-row">
                <td><div className="skeleton" style={{ width: 52, height: 52, borderRadius: '.6rem' }} /></td>
                <td><div className="skeleton" style={{ width: '70%', height: 14, marginBottom: 7 }} /><div className="skeleton" style={{ width: '42%', height: 11 }} /></td>
                <td><div className="skeleton" style={{ width: 88, height: 14 }} /></td>
                <td><div className="skeleton" style={{ width: 70, height: 14 }} /></td>
                <td><div className="skeleton" style={{ width: 84, height: 22, borderRadius: 999 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
