'use client'

import { motion } from 'framer-motion'

interface FormStep4Props {
  formData: {
    budget_challenge: string
  }
  updateFormData: (data: Partial<FormStep4Props['formData']>) => void
  errors: Record<string, string>
}

export default function FormStep4({ formData, updateFormData, errors }: FormStep4Props) {
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
          Reto Final
        </h2>
        <p className="text-neutral-500 mt-2">Demuéstranos tu creatividad bajo presión</p>
      </div>

      {/* Challenge box */}
      <div className="bg-neutral-900 text-white p-8 rounded-2xl">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-4xl md:text-5xl font-semibold">$1M</span>
          <span className="text-neutral-400">COP</span>
          <span className="text-neutral-600 mx-2">+</span>
          <span className="text-4xl md:text-5xl font-semibold">48h</span>
        </div>
        <p className="text-neutral-300 leading-relaxed">
          Si te damos este presupuesto y tiempo para generar ventas para Dosmicos, ¿qué harías exactamente?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Tu estrategia
        </label>
        <textarea
          value={formData.budget_challenge}
          onChange={(e) => updateFormData({ budget_challenge: e.target.value })}
          rows={10}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
            ${errors.budget_challenge
              ? 'border-red-400 bg-red-50'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
            }
            focus:outline-none`}
          placeholder="Describe tu estrategia paso a paso...&#10;&#10;- ¿En qué invertirías el dinero?&#10;- ¿Qué acciones tomarías?&#10;- ¿Cómo medirías el éxito?"
        />
        {errors.budget_challenge && (
          <p className="text-red-500 text-sm mt-2">{errors.budget_challenge}</p>
        )}
      </div>

      <p className="text-sm text-neutral-400">
        Sé específico y realista. Queremos ver cómo priorizas y ejecutas.
      </p>
    </motion.div>
  )
}
