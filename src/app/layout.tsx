import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Únete al equipo | Dosmicos',
  description: 'Prueba creativa para prácticas de marketing en Dosmicos - la marca colombiana de ropa para niños de más rápido crecimiento.',
  keywords: ['dosmicos', 'prácticas', 'marketing', 'colombia', 'ropa infantil', 'empleo'],
  openGraph: {
    title: 'Únete al equipo de Marketing | Dosmicos',
    description: 'Prueba creativa para prácticas de marketing en Dosmicos',
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
