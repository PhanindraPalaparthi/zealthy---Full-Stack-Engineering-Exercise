'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

export default function PortalMedications() {
  const [allRefills, setAllRefills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/summary').then(r => r.json()).then(d => {
      setAllRefills(d.allRefills || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Prescriptions & Refills</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Upcoming refill schedule for the next 3 months</p>
      </div>
      {allRefills.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>No upcoming refills</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No prescriptions scheduled for the next 3 months.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Refill Date</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {allRefills.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.medication}</td>
                    <td><span className="badge badge-blue">{r.dosage}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{r.quantity} unit{r.quantity !== 1 ? 's' : ''}</td>
                    <td>{format(parseISO(r.occurrenceDate), 'MMM d, yyyy')}</td>
                    <td><span className="badge badge-green">{r.refill_schedule.charAt(0).toUpperCase() + r.refill_schedule.slice(1)}</span></td>
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