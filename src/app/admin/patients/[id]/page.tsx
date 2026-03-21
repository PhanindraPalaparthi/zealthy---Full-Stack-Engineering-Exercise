'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { format, parseISO } from 'date-fns'

interface Patient { id: number; name: string; email: string; phone?: string; dob?: string; address?: string }
interface Appointment { id: number; provider: string; datetime: string; repeat: string; end_date?: string }
interface Prescription { id: number; medication: string; dosage: string; quantity: number; refill_on: string; refill_schedule: string }

const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly']
const SCHEDULE_OPTIONS = ['daily', 'weekly', 'monthly', 'quarterly']
const EMPTY_APPT = { provider: '', datetime: '', repeat: 'weekly', end_date: '' }
const EMPTY_RX = { medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly' }

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F0F4F8' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function PatientDetail() {
  const params = useParams()
  const id = params?.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [meds, setMeds] = useState<string[]>([])
  const [dosages, setDosages] = useState<string[]>([])

  const [editPatient, setEditPatient] = useState(false)
  const [patientForm, setPatientForm] = useState<any>({})
  const [savingPatient, setSavingPatient] = useState(false)

  const [apptModal, setApptModal] = useState(false)
  const [apptForm, setApptForm] = useState<any>(EMPTY_APPT)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)
  const [deleteApptId, setDeleteApptId] = useState<number | null>(null)
  const [savingAppt, setSavingAppt] = useState(false)
  const [deletingAppt, setDeletingAppt] = useState(false)

  const [rxModal, setRxModal] = useState(false)
  const [rxForm, setRxForm] = useState<any>(EMPTY_RX)
  const [editRx, setEditRx] = useState<Prescription | null>(null)
  const [deleteRxId, setDeleteRxId] = useState<number | null>(null)
  const [savingRx, setSavingRx] = useState(false)
  const [deletingRx, setDeletingRx] = useState(false)

  const loadPatient = async () => {
    const res = await fetch(`/api/patients/${id}`)
    const d = await res.json()
    if (d.user) { setPatient(d.user); setPatientForm(d.user) }
  }
  const loadAppts = async () => {
    const res = await fetch(`/api/patients/${id}/appointments`)
    const d = await res.json()
    setAppointments(d.appointments || [])
  }
  const loadRx = async () => {
    const res = await fetch(`/api/patients/${id}/prescriptions`)
    const d = await res.json()
    setPrescriptions(d.prescriptions || [])
  }
  const loadMeds = async () => {
    const res = await fetch('/api/medications')
    const d = await res.json()
    setMeds(d.medications || [])
    setDosages(d.dosages || [])
  }

  useEffect(() => {
    if (id) { loadPatient(); loadAppts(); loadRx(); loadMeds() }
  }, [id])

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (patientForm.dob && patientForm.dob > new Date().toISOString().split('T')[0]) {
      alert('Date of birth cannot be a future date')
      return
    }
  
    setSavingPatient(true)
    await fetch(`/api/patients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patientForm) })
    setSavingPatient(false)
    setEditPatient(false)
    loadPatient()
  }
  
  const openApptEdit = (a: Appointment) => {
    setEditAppt(a)
    setApptForm({ provider: a.provider, datetime: a.datetime.slice(0, 16), repeat: a.repeat, end_date: a.end_date || '' })
    setApptModal(true)
  }
  const openApptCreate = () => { setEditAppt(null); setApptForm(EMPTY_APPT); setApptModal(true) }

  const saveAppt = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAppt(true)
    if (editAppt) {
      await fetch(`/api/patients/${id}/appointments/${editAppt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apptForm) })
    } else {
      await fetch(`/api/patients/${id}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apptForm) })
    }
    setSavingAppt(false)
    setApptModal(false)
    loadAppts()
  }

  const confirmDeleteAppt = async () => {
    if (!deleteApptId) return
    setDeletingAppt(true)
    await fetch(`/api/patients/${id}/appointments/${deleteApptId}`, { method: 'DELETE' })
    setDeletingAppt(false)
    setDeleteApptId(null)
    loadAppts()
  }

  const openRxEdit = (rx: Prescription) => {
    setEditRx(rx)
    setRxForm({ medication: rx.medication, dosage: rx.dosage, quantity: rx.quantity, refill_on: rx.refill_on, refill_schedule: rx.refill_schedule })
    setRxModal(true)
  }
  const openRxCreate = () => { setEditRx(null); setRxForm({ ...EMPTY_RX, medication: meds[0] || '', dosage: dosages[0] || '' }); setRxModal(true) }

  const saveRx = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRx(true)
    if (editRx) {
      await fetch(`/api/patients/${id}/prescriptions/${editRx.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rxForm) })
    } else {
      await fetch(`/api/patients/${id}/prescriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rxForm) })
    }
    setSavingRx(false)
    setRxModal(false)
    loadRx()
  }

  const confirmDeleteRx = async () => {
    if (!deleteRxId) return
    setDeletingRx(true)
    await fetch(`/api/patients/${id}/prescriptions/${deleteRxId}`, { method: 'DELETE' })
    setDeletingRx(false)
    setDeleteRxId(null)
    loadRx()
  }

  if (!id || !patient) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
        <Link href="/admin" style={{ color: 'var(--green)', textDecoration: 'none' }}>Patients</Link>
        <span>›</span>
        <span style={{ color: 'var(--navy)' }}>{patient.name}</span>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-light), #c8eed9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--green-dark)' }}>
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{patient.name}</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{patient.email}</p>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => setEditPatient(true)}>Edit Patient</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 20, paddingTop: 20, borderTop: '1px solid #F0F4F8' }}>
          {[
            { label: 'Phone', value: patient.phone || '—' },
            { label: 'Date of Birth', value: patient.dob || '—' },
            { label: 'Address', value: patient.address || '—' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: 'var(--navy)' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionCard title={`Appointments (${appointments.length})`} action={
        <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={openApptCreate}>+ Add</button>
      }>
        {appointments.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No appointments yet.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Provider</th><th>Date & Time</th><th>Repeat</th><th>Ends</th><th></th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.provider}</td>
                    <td>{format(parseISO(a.datetime), 'MMM d, yyyy • h:mm a')}</td>
                    <td><span className={`badge ${a.repeat === 'none' ? 'badge-gray' : 'badge-green'}`}>{a.repeat}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.end_date ? format(parseISO(a.end_date), 'MMM d, yyyy') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openApptEdit(a)}>Edit</button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setDeleteApptId(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title={`Prescriptions (${prescriptions.length})`} action={
        <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={openRxCreate}>+ Add</button>
      }>
        {prescriptions.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No prescriptions yet.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Medication</th><th>Dosage</th><th>Quantity</th><th>Refill On</th><th>Schedule</th><th></th></tr></thead>
              <tbody>
                {prescriptions.map(rx => (
                  <tr key={rx.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{rx.medication}</td>
                    <td><span className="badge badge-blue">{rx.dosage}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{rx.quantity}</td>
                    <td>{format(parseISO(rx.refill_on), 'MMM d, yyyy')}</td>
                    <td><span className="badge badge-green">{rx.refill_schedule}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openRxEdit(rx)}>Edit</button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setDeleteRxId(rx.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal open={editPatient} onClose={() => setEditPatient(false)} title="Edit Patient">
        <form onSubmit={savePatient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', required: true },
              { label: 'Email', key: 'email', type: 'email', required: true },
              { label: 'New Password', key: 'password', type: 'password', required: false },
              { label: 'Phone', key: 'phone', type: 'text', required: false },
              { label: 'Date of Birth', key: 'dob', type: 'date', required: false },
              { label: 'Address', key: 'address', type: 'text', required: false },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>{f.label}{f.required ? ' *' : ''}</label>
                <input className="input" type={f.type} value={patientForm[f.key] || ''} required={f.required}
                  onChange={e => setPatientForm({ ...patientForm, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setEditPatient(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingPatient}>{savingPatient ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={apptModal} onClose={() => setApptModal(false)} title={editAppt ? 'Edit Appointment' : 'New Appointment'}>
        <form onSubmit={saveAppt} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Provider *</label>
            <input className="input" value={apptForm.provider} onChange={e => setApptForm({ ...apptForm, provider: e.target.value })} required placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Date & Time *</label>
            <input className="input" type="datetime-local" value={apptForm.datetime} onChange={e => setApptForm({ ...apptForm, datetime: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Repeat Schedule</label>
            <select className="input" value={apptForm.repeat} onChange={e => setApptForm({ ...apptForm, repeat: e.target.value })}>
              {REPEAT_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </div>
          {apptForm.repeat !== 'none' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>End Date (optional)</label>
              <input className="input" type="date" value={apptForm.end_date} onChange={e => setApptForm({ ...apptForm, end_date: e.target.value })} />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Leave blank for ongoing recurring appointments.</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setApptModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingAppt}>{savingAppt ? 'Saving…' : editAppt ? 'Save Changes' : 'Add Appointment'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={rxModal} onClose={() => setRxModal(false)} title={editRx ? 'Edit Prescription' : 'New Prescription'}>
        <form onSubmit={saveRx} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Medication *</label>
              <select className="input" value={rxForm.medication} onChange={e => setRxForm({ ...rxForm, medication: e.target.value })} required>
                <option value="">Select medication</option>
                {meds.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Dosage *</label>
              <select className="input" value={rxForm.dosage} onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })} required>
                <option value="">Select dosage</option>
                {dosages.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Quantity *</label>
              <input className="input" type="number" min={1} value={rxForm.quantity} onChange={e => setRxForm({ ...rxForm, quantity: parseInt(e.target.value) })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>First Refill Date *</label>
              <input className="input" type="date" value={rxForm.refill_on} onChange={e => setRxForm({ ...rxForm, refill_on: e.target.value })} required />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 5 }}>Refill Schedule</label>
            <select className="input" value={rxForm.refill_schedule} onChange={e => setRxForm({ ...rxForm, refill_schedule: e.target.value })}>
              {SCHEDULE_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setRxModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingRx}>{savingRx ? 'Saving…' : editRx ? 'Save Changes' : 'Add Prescription'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteApptId} onClose={() => setDeleteApptId(null)} onConfirm={confirmDeleteAppt} loading={deletingAppt} title="Delete Appointment" message="Are you sure you want to delete this appointment?" />
      <ConfirmDialog open={!!deleteRxId} onClose={() => setDeleteRxId(null)} onConfirm={confirmDeleteRx} loading={deletingRx} title="Delete Prescription" message="Are you sure you want to delete this prescription?" />
    </div>
  )
}