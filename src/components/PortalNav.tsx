'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Props { name: string }

export default function PortalNav({ name }: Props) {
  const path = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const links = [
    { href: '/portal', label: 'Dashboard' },
    { href: '/portal/appointments', label: 'Appointments' },
    { href: '/portal/medications', label: 'Medications' },
  ]

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #E8EDF2', padding: '0 32px', display: 'flex', alignItems: 'center', height: 60, gap: 8, position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--green), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>Z</div>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, color: 'var(--navy)' }}>Zealthy</span>
      </Link>
      {links.map(l => (
        <Link key={l.href} href={l.href} style={{ color: path === l.href ? 'var(--green)' : 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 6, background: path === l.href ? 'var(--green-light)' : 'transparent' }}>
          {l.label}
        </Link>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-light), #c8eed9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{name}</span>
        <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 13, padding: '5px 12px' }}>Log out</button>
      </div>
    </nav>
  )
}