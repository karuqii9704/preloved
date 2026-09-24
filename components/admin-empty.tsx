import Link from 'next/link'

// Empty state seragam untuk halaman admin — pesan jelas + aksi opsional.
export function AdminEmpty({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="empty-card motion-in-2">
      <strong>{title}</strong>
      <p style={{ margin: '0 auto', maxWidth: 420 }}>{body}</p>
      {action && (
        <p style={{ marginTop: 16, marginBottom: 0 }}>
          <Link href={action.href} className="btn">{action.label}</Link>
        </p>
      )}
    </div>
  )
}
