'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { jsPDF } from 'jspdf'
import { getApplications, CandidateApplication } from '@/lib/supabase'
import { removeAuthToken } from '@/lib/auth'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await getApplications()
      setApplications(data)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    removeAuthToken()
    window.location.reload()
  }

  const filteredApplications = applications.filter(app =>
    app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.university.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generatePDF = (app: CandidateApplication) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let yPosition = 20

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, maxWidth)

      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, margin, yPosition)
        yPosition += fontSize * 0.5
      })
      yPosition += 4
    }

    // Helper function to add a section title
    const addSectionTitle = (title: string) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      yPosition += 6
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 100, 100)
      doc.text(title.toUpperCase(), margin, yPosition)
      yPosition += 8
      doc.setTextColor(0, 0, 0)
    }

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('DOSMICOS HIRING', margin, yPosition)
    yPosition += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Aplicación de candidato', margin, yPosition)
    doc.setTextColor(0, 0, 0)
    yPosition += 15

    // Candidate info section
    addSectionTitle('Datos del candidato')
    addWrappedText(`Nombre: ${app.full_name}`, 11)
    addWrappedText(`Email: ${app.email}`, 11)
    addWrappedText(`Teléfono: ${app.phone}`, 11)
    addWrappedText(`Universidad: ${app.university}`, 11)
    addWrappedText(`Portafolio: ${app.portfolio_link || 'No proporcionado'}`, 11)
    addWrappedText(`Hoja de vida: ${app.resume_url ? 'Adjunta' : 'No proporcionada'}`, 11)
    addWrappedText(`Fecha: ${app.created_at ? formatDate(app.created_at) : 'N/A'}`, 11)

    // Impressive Achievement section
    if (app.impressive_achievement) {
      addSectionTitle('Logro más impresionante')
      addWrappedText(app.impressive_achievement, 10)
    }

    // Diagnostic section
    addSectionTitle('Diagnóstico Rápido')
    addWrappedText('1. ¿Qué está funcionando bien?', 11, true)
    addWrappedText(app.diagnostic_whats_working, 10)
    yPosition += 4
    addWrappedText('2. ¿Qué mejorarías?', 11, true)
    addWrappedText(app.diagnostic_improvements, 10)
    yPosition += 4
    addWrappedText('3. ¿Qué oportunidad estamos dejando pasar?', 11, true)
    addWrappedText(app.diagnostic_missed_opportunity, 10)

    // Campaign section
    addSectionTitle('Concepto de Campaña')
    addWrappedText(`Nombre: ${app.campaign_name}`, 11, true)
    yPosition += 2
    addWrappedText('Concepto:', 11, true)
    addWrappedText(app.campaign_concept, 10)
    yPosition += 4
    addWrappedText('Ejecuciones:', 11, true)
    addWrappedText(app.campaign_executions, 10)

    // Budget challenge section
    addSectionTitle('Reto Final ($1M + 48h)')
    addWrappedText(app.budget_challenge, 10)

    // Save the PDF
    doc.save(`aplicacion_${app.full_name.replace(/\s+/g, '_')}.pdf`)
  }

  const exportAllToCSV = () => {
    const headers = [
      'Nombre', 'Email', 'Teléfono', 'Universidad', 'Portafolio', 'Fecha',
      'Qué funciona', 'Qué mejorar', 'Oportunidad',
      'Nombre campaña', 'Concepto', 'Ejecuciones',
      'Reto $1M'
    ]

    const rows = applications.map(app => [
      app.full_name,
      app.email,
      app.phone,
      app.university,
      app.portfolio_link || '',
      app.created_at ? formatDate(app.created_at) : '',
      app.diagnostic_whats_working.replace(/"/g, '""'),
      app.diagnostic_improvements.replace(/"/g, '""'),
      app.diagnostic_missed_opportunity.replace(/"/g, '""'),
      app.campaign_name.replace(/"/g, '""'),
      app.campaign_concept.replace(/"/g, '""'),
      app.campaign_executions.replace(/"/g, '""'),
      app.budget_challenge.replace(/"/g, '""')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aplicaciones_dosmicos_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo_dosmicos.png"
              alt="Dosmicos"
              width={100}
              height={40}
            />
            <span className="text-neutral-300">|</span>
            <span className="text-sm font-medium text-neutral-600">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <p className="text-sm text-neutral-500">Total aplicaciones</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-1">{applications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <p className="text-sm text-neutral-500">Esta semana</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-1">
              {applications.filter(app => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(app.created_at || '') > weekAgo
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <p className="text-sm text-neutral-500">Hoy</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-1">
              {applications.filter(app => {
                const today = new Date().toDateString()
                return new Date(app.created_at || '').toDateString() === today
              }).length}
            </p>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email o universidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200
                focus:border-neutral-900 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={exportAllToCSV}
            className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg
              hover:bg-neutral-800 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        </div>

        {/* Applications list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No hay aplicaciones</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Candidato
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Universidad
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Campaña
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">{app.full_name}</p>
                        <p className="text-sm text-neutral-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 hidden md:table-cell">
                      {app.university}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 hidden md:table-cell">
                      {app.campaign_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 hidden sm:table-cell">
                      {app.created_at ? formatDate(app.created_at) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900
                            hover:bg-neutral-100 rounded-lg transition-all"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => generatePDF(app)}
                          className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900
                            hover:bg-neutral-100 rounded-lg transition-all"
                        >
                          Descargar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application detail modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{selectedApp.full_name}</h2>
                  <p className="text-sm text-neutral-500">{selectedApp.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generatePDF(selectedApp)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900
                      hover:bg-neutral-100 rounded-lg transition-all"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-8">
                {/* Personal info */}
                <section>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                    Datos del candidato
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">Teléfono</p>
                      <p className="text-neutral-900">{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Universidad</p>
                      <p className="text-neutral-900">{selectedApp.university}</p>
                    </div>
                    {selectedApp.portfolio_link && (
                      <div className="col-span-2">
                        <p className="text-sm text-neutral-500">Portafolio</p>
                        <a
                          href={selectedApp.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedApp.portfolio_link}
                        </a>
                      </div>
                    )}
                    {selectedApp.resume_url && (
                      <div className="col-span-2">
                        <p className="text-sm text-neutral-500">Hoja de vida</p>
                        <a
                          href={selectedApp.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar CV
                        </a>
                      </div>
                    )}
                  </div>
                </section>

                {/* Impressive Achievement */}
                {selectedApp.impressive_achievement && (
                  <section>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                      Logro más impresionante
                    </h3>
                    <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4">{selectedApp.impressive_achievement}</p>
                  </section>
                )}

                {/* Diagnostic */}
                <section>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                    Diagnóstico Rápido
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">1. ¿Qué está funcionando bien?</p>
                      <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4">{selectedApp.diagnostic_whats_working}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">2. ¿Qué mejorarías?</p>
                      <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4">{selectedApp.diagnostic_improvements}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">3. ¿Qué oportunidad estamos dejando pasar?</p>
                      <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4">{selectedApp.diagnostic_missed_opportunity}</p>
                    </div>
                  </div>
                </section>

                {/* Campaign */}
                <section>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                    Concepto de Campaña
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Nombre de la campaña</p>
                      <p className="text-neutral-900 text-lg font-medium">{selectedApp.campaign_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Concepto creativo</p>
                      <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4">{selectedApp.campaign_concept}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Ejecuciones</p>
                      <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4 whitespace-pre-wrap">{selectedApp.campaign_executions}</p>
                    </div>
                  </div>
                </section>

                {/* Budget challenge */}
                <section>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                    Reto Final ($1M + 48h)
                  </h3>
                  <p className="text-neutral-600 bg-neutral-50 rounded-lg p-4 whitespace-pre-wrap">{selectedApp.budget_challenge}</p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
