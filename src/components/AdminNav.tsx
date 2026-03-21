'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const path = usePathname()

  return (
    <nav style={{ background: 'var(--navy)', color: 'white', padding: '0 32px', display: 'flex', alignItems: 'center', height: 60, gap: 32, position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--green-mid), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>Z</div>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, color: 'white' }}>
          Zealthy <span style={{ color: 'var(--green-mid)', fontSize: 13, fontWeight: 400, fontFamily: 'DM Sans, sans-serif' }}>EMR</span>
        </span>
      </Link>
      <div style={{ flex: 1 }} />
      <Link href="/admin" style={{ color: path === '/admin' ? 'var(--green-mid)' : 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 14, fontWeight: 500, paddingBottom: 2, borderBottom: path === '/admin' ? '2px solid var(--green-mid)' : '2px solid transparent' }}>
        Patients
      </Link>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--green)')}>
        Patient Portal →
      </Link>
    </nav>
  )
}