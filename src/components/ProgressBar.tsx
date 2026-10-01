'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

const stepNames = ['Datos', 'Diagnóstico', 'Campaña', 'Reto']

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Step indicators - dots */}
      <div className="flex justify-center items-center gap-3 mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300
              ${index < currentStep
                ? 'bg-neutral-900'
                : index === currentStep
                  ? 'bg-neutral-900 w-6'
                  : 'bg-neutral-300'
              }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>

      {/* Current step name */}
      <motion.p
        key={currentStep}
        className="text-center text-sm text-neutral-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        {stepNames[currentStep]}
      </motion.p>
    </div>
  )
}
