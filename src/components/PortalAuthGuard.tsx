'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PortalNav from './PortalNav'

export default function PortalAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.push('/'); return }
        setUser(d.user)
        setLoading(false)
      })
      .catch(() => router.push('/'))
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-warm)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--green), var(--teal))', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 22 }}>Z</div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your portal…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-warm)' }}>
      <PortalNav name={user.name} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}