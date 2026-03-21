'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { format } from 'date-fns'

interface Patient {
  id: number
  name: string
  email: string
  phone?: string
  dob?: string
  appointment_count: number
  prescription_count: number
  created_at: string
}

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', dob: '', address: '' }

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/patients')
      .then(r => r.json())
      .then(d => {
        const users = (d.users || []).map((u: any) => ({ ...u, id: Number(u.id) }))
        setPatients(users)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
  
    if (form.dob && form.dob > new Date().toISOString().split('T')[0]) {
      setError('Date of birth cannot be a future date')
      return
    }
  
    setSaving(true)
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Failed to create patient'); return }
    setShowCreate(false)
    setForm(EMPTY_FORM)
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
            Patient Registry
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{patients.length} total patients</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setError('') }}>
          + New Patient
        </button>
      </div>

      <input
        className="input"
        style={{ maxWidth: 360 }}
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading patients…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <p>No patients found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Appointments</th>
                  <th>Prescriptions</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-light), #c8eed9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', flexShrink: 0 }}>
                          {p.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{p.email}</td>
                    <td style={{ color: 'var(--muted)' }}>{p.phone || '—'}</td>
                    <td><span className="badge badge-green">{Number(p.appointment_count)}</span></td>
                    <td><span className="badge badge-blue">{Number(p.prescription_count)}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <Link href={`/admin/patients/${Number(p.id)}`} className="btn btn-secondary" style={{ fontSize: 13 }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Patient">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="john@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Password *</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Date of Birth</label>
              <input 
                    className="input" 
                    type="date" 
                    value={form.dob} 
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      const date = e.target.value
                      if (date <= new Date().toISOString().split('T')[0]) {
                        setForm({ ...form, dob: date })
                      }
                    }}
                />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Address</label>
              <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
            </div>
          </div>
          {error && (
            <div style={{ background: '#FEF2F2', borderRadius: 6, padding: '8px 12px', color: '#DC2626', fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Patient'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}