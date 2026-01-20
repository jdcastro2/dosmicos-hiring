'use client'

import { motion } from 'framer-motion'

interface FormStep3Props {
  formData: {
    campaign_name: string
    campaign_concept: string
    campaign_executions: string
  }
  updateFormData: (data: Partial<FormStep3Props['formData']>) => void
  errors: Record<string, string>
}

export default function FormStep3({ formData, updateFormData, errors }: FormStep3Props) {
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
          Concepto de Campaña
        </h2>
        <p className="text-neutral-500 mt-2">Diseña una campaña para la temporada de frío</p>
      </div>

      {/* Brief */}
      <div className="border-l-2 border-neutral-900 pl-6 py-2">
        <p className="text-neutral-600 leading-relaxed">
          Se acerca la temporada de frío en Bogotá (mayo-agosto). Queremos una campaña que posicione las ruanas Dosmicos como <span className="text-neutral-900 font-medium">el regalo perfecto que los papás compran y los niños aman.</span>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre de la campaña
          </label>
          <input
            type="text"
            value={formData.campaign_name}
            onChange={(e) => updateFormData({ campaign_name: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.campaign_name
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="Un nombre memorable..."
          />
          {errors.campaign_name && (
            <p className="text-red-500 text-sm mt-2">{errors.campaign_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Concepto creativo
            <span className="text-neutral-400 font-normal ml-2">Máximo 3 oraciones</span>
          </label>
          <textarea
            value={formData.campaign_concept}
            onChange={(e) => updateFormData({ campaign_concept: e.target.value })}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.campaign_concept
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="¿Cuál es la idea central de tu campaña?"
          />
          {errors.campaign_concept && (
            <p className="text-red-500 text-sm mt-2">{errors.campaign_concept}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            3 ejecuciones concretas
            <span className="text-neutral-400 font-normal ml-2">Posts, reels, activaciones...</span>
          </label>
          <textarea
            value={formData.campaign_executions}
            onChange={(e) => updateFormData({ campaign_executions: e.target.value })}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${errors.campaign_executions
                ? 'border-red-400 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 bg-white'
              }
              focus:outline-none`}
            placeholder="1. Primera ejecución...&#10;2. Segunda ejecución...&#10;3. Tercera ejecución..."
          />
          {errors.campaign_executions && (
            <p className="text-red-500 text-sm mt-2">{errors.campaign_executions}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-400 italic">
        No necesitamos diseños terminados. Queremos ver cómo piensas.
      </p>
    </motion.div>
  )
}
