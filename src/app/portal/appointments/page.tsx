'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

export default function PortalAppointments() {
  const [allAppts, setAllAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/summary').then(r => r.json()).then(d => {
      setAllAppts(d.allAppts || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Upcoming Appointments</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your full schedule for the next 3 months</p>
      </div>
      {allAppts.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>No upcoming appointments</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Contact your provider to schedule an appointment.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {allAppts.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{a.provider}</td>
                    <td>{format(parseISO(a.occurrenceDate), 'EEEE, MMM d, yyyy • h:mm a')}</td>
                    <td>
                      <span className={`badge ${a.repeat === 'none' ? 'badge-gray' : 'badge-green'}`}>
                        {a.repeat === 'none' ? 'One-time' : a.repeat.charAt(0).toUpperCase() + a.repeat.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}