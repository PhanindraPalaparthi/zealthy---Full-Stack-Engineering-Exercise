'use client'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes zealthy-modal-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .zealthy-modal-content { animation: zealthy-modal-in 180ms ease forwards; }
      `}</style>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(26,43,60,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="card zealthy-modal-content" style={{ width: '100%', maxWidth: wide ? 640 : 480 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F4F8' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600, color: 'var(--navy)' }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--muted)', padding: '0 4px' }}>×</button>
          </div>
          <div style={{ padding: '20px 24px' }}>{children}</div>
        </div>
      </div>
    </>
  )
}