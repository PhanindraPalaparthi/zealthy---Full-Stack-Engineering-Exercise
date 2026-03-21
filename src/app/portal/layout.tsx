import PortalAuthGuard from '@/components/PortalAuthGuard'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalAuthGuard>{children}</PortalAuthGuard>
}