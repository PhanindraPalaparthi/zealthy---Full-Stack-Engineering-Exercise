import AdminNav from '@/components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-warm)' }}>
      <AdminNav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}   