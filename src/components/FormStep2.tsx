'use client'

import { motion } from 'framer-motion'

interface FormStep2Props {
  formData: {
    diagnostic_whats_working: string
    diagnostic_improvements: string
    diagnostic_missed_opportunity: string
  }
  updateFormData: (data: Partial<FormStep2Props['formData']>) => void
  errors: Record<string, string>
}

export default function FormStep2({ formData, updateFormData, errors }: FormStep2Props) {
  const maxChars = 500

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
          Diagnóstico Rápido
        </h2>
        <p className="text-neutral-500 mt-2">
          Revisa nuestras redes{' '}
          <a
            href="https://instagram.com/dosmicos.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 font-medium link-underline"
          >
            @dosmicos.co
          </a>
          {' '}y responde
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            1. ¿Qué está funcionando bien en nuestra comunicación actual?
          </label>
          <textarea
            value={formData.diagnostic_whats_working}
            onChange={(e) => updateFormData({ diagnostic_whats_working: e.target.value })}
            rows={4}
            maxLength={maxChars}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.diagnostic_whats_working
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Identifica lo que está funcionando..."
          />
          <div className="flex justify-between items-center mt-2">
            {errors.diagnostic_whats_working && (
              <p className="text-red-500 text-sm">{errors.diagnostic_whats_working}</p>
            )}
            <p className="text-sm text-neutral-400 ml-auto">
              {formData.diagnostic_whats_working.length}/{maxChars}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            2. ¿Qué mejorarías o cambiarías? Sé específico.
          </label>
          <textarea
            value={formData.diagnostic_improvements}
            onChange={(e) => updateFormData({ diagnostic_improvements: e.target.value })}
            rows={4}
            maxLength={maxChars}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.diagnostic_improvements
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Propón mejoras específicas..."
          />
          <div className="flex justify-between items-center mt-2">
            {errors.diagnostic_improvements && (
              <p className="text-red-500 text-sm">{errors.diagnostic_improvements}</p>
            )}
            <p className="text-sm text-neutral-400 ml-auto">
              {formData.diagnostic_improvements.length}/{maxChars}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            3. ¿Qué oportunidad grande estamos dejando pasar?
          </label>
          <textarea
            value={formData.diagnostic_missed_opportunity}
            onChange={(e) => updateFormData({ diagnostic_missed_opportunity: e.target.value })}
            rows={4}
            maxLength={maxChars}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.diagnostic_missed_opportunity
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Identifica una oportunidad..."
          />
          <div className="flex justify-between items-center mt-2">
            {errors.diagnostic_missed_opportunity && (
              <p className="text-red-500 text-sm">{errors.diagnostic_missed_opportunity}</p>
            )}
            <p className="text-sm text-neutral-400 ml-auto">
              {formData.diagnostic_missed_opportunity.length}/{maxChars}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
