import { AdminNav } from '@/components/admin-nav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream)' }}>
      <div className="shell" style={{ padding: '12px 0' }}>
        <AdminNav />
      </div>
      <div style={{ background: 'white' }}>{children}</div>
    </div>
  )
}
