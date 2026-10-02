import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Únete al equipo | Dosmicos',
  description: 'Prácticas creativas en Dosmicos: audiovisual y comunicación digital. Presencial en Bogotá.',
  keywords: ['dosmicos', 'prácticas', 'marketing', 'colombia', 'ropa infantil', 'empleo'],
  openGraph: {
    title: 'Prácticas creativas | Dosmicos',
    description: 'Postulación a prácticas creativas en Dosmicos',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
