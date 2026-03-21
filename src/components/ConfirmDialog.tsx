'use client'
import Modal from './Modal'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  loading?: boolean
}

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure? This action cannot be undone.', loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>
  )
}