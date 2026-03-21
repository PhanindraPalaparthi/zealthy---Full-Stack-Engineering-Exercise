import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zealthy Health',
  description: 'Patient Portal & EMR',
  icons: { icon: 'data:,' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}