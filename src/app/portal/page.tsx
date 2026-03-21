'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface Summary {
  user: { name: string; email: string; phone?: string; dob?: string; address?: string }
  upcomingAppts: any[]
  upcomingRefills: any[]
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

export default function PortalDashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/summary').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading your dashboard…</div>
  if (!data) return null

  const { user, upcomingAppts, upcomingRefills } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
          Hello, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>Here's your health summary for the next 7 days.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Upcoming appointments" value={upcomingAppts.length} icon="📅" color="var(--green-light)" />
        <StatCard label="Refills this week" value={upcomingRefills.length} icon="💊" color="#EFF6FF" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Appointments this week</h2>
            <Link href="/portal/appointments" style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          {upcomingAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
              No appointments in the next 7 days
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingAppts.map((a, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--green-light)', borderRadius: 8, borderLeft: '3px solid var(--green)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{a.provider}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{format(parseISO(a.occurrenceDate), 'MMM d, yyyy • h:mm a')}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-green">{a.repeat === 'none' ? 'One-time' : a.repeat}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Refills this week</h2>
            <Link href="/portal/medications" style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          {upcomingRefills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
              No refills due in the next 7 days
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingRefills.map((r, i) => (
                <div key={i} style={{ padding: '12px 14px', background: '#EFF6FF', borderRadius: 8, borderLeft: '3px solid #3B82F6' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{r.medication}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{r.dosage} · Qty {r.quantity}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Refill: {format(parseISO(r.occurrenceDate), 'MMM d, yyyy')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Your information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[
            { label: 'Full name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Phone', value: user.phone || '—' },
            { label: 'Date of birth', value: user.dob || '—' },
            { label: 'Address', value: user.address || '—' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}