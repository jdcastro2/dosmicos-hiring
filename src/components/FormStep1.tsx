'use client'

import { motion } from 'framer-motion'

interface FormStep1Props {
  formData: {
    full_name: string
    email: string
    phone: string
    university: string
    portfolio_link: string
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
      </div>
    </motion.div>
  )
}
