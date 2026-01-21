'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { uploadResume } from '@/lib/supabase'

interface FormStep1Props {
  formData: {
    full_name: string
    email: string
    phone: string
    university: string
    portfolio_link: string
    resume_url: string
    impressive_achievement: string
  }
  updateFormData: (data: Partial<FormStep1Props['formData']>) => void
  errors: Record<string, string>
}

const universities = [
  'Universidad Jorge Tadeo Lozano',
  'Universidad de los Andes',
  'Pontificia Universidad Javeriana',
  'Universidad Nacional de Colombia',
  'Universidad del Rosario',
  'Universidad Externado de Colombia',
  'Universidad de La Sabana',
  'Universidad EAN',
  'Politécnico Grancolombiano',
  'CESA',
  'Otra',
]

export default function FormStep1({ formData, updateFormData, errors }: FormStep1Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 5MB.')
      return
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF o Word.')
      return
    }

    setIsUploading(true)
    try {
      const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const url = await uploadResume(file, uniqueName)
      updateFormData({ resume_url: url })
      setFileName(file.name)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo. Intenta de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-tight">
          Cuéntanos sobre ti
        </h2>
        <p className="text-neutral-500 mt-2">Queremos conocerte mejor</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => updateFormData({ full_name: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.full_name
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Tu nombre completo"
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm mt-2">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.email
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.phone
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="+57 300 123 4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Universidad
          </label>
          <select
            value={formData.university}
            onChange={(e) => updateFormData({ university: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer
              ${errors.university
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
          >
            <option value="">Selecciona tu universidad</option>
            {universities.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          {errors.university && (
            <p className="text-red-500 text-sm mt-2">{errors.university}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Link a tu portafolio <span className="text-neutral-400 font-normal">(opcional)</span>
          </label>
          <input
            type="url"
            value={formData.portfolio_link}
            onChange={(e) => updateFormData({ portfolio_link: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 hover:border-neutral-300
              focus:border-neutral-900 bg-white focus:outline-none transition-all duration-200"
            placeholder="https://tuportafolio.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Hoja de vida <span className="text-neutral-400 font-normal">(opcional - PDF o Word, máx 5MB)</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="resume-upload"
              className={`w-full px-4 py-3 rounded-lg border border-neutral-200 hover:border-neutral-300
                bg-white cursor-pointer transition-all duration-200 flex items-center justify-between
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={fileName || formData.resume_url ? 'text-neutral-900' : 'text-neutral-400'}>
                {isUploading ? 'Subiendo...' : fileName || (formData.resume_url ? 'Archivo subido' : 'Seleccionar archivo')}
              </span>
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </label>
            {formData.resume_url && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Archivo subido correctamente
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Qué es lo más impresionante que has construido, organizado o logrado FUERA de la universidad y de las notas académicas?
          </label>
          <textarea
            value={formData.impressive_achievement}
            onChange={(e) => updateFormData({ impressive_achievement: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none
              ${errors.impressive_achievement
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Cuéntanos en dos frases..."
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.impressive_achievement && (
              <p className="text-red-500 text-sm">{errors.impressive_achievement}</p>
            )}
            <p className="text-neutral-400 text-sm ml-auto">{formData.impressive_achievement.length}/500</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
