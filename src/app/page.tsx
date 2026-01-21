'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ProgressBar from '@/components/ProgressBar'
import FormStep1 from '@/components/FormStep1'
import FormStep2 from '@/components/FormStep2'
import FormStep3 from '@/components/FormStep3'
import FormStep4 from '@/components/FormStep4'
import SuccessScreen from '@/components/SuccessScreen'
import StatsDisplay from '@/components/StatsDisplay'
import { submitApplication, CandidateApplication } from '@/lib/supabase'

interface FormData {
  full_name: string
  email: string
  phone: string
  university: string
  portfolio_link: string
  resume_url: string
  impressive_achievement: string
  diagnostic_whats_working: string
  diagnostic_improvements: string
  diagnostic_missed_opportunity: string
  campaign_name: string
  campaign_concept: string
  campaign_executions: string
  budget_challenge: string
}

const initialFormData: FormData = {
  full_name: '',
  email: '',
  phone: '',
  university: '',
  portfolio_link: '',
  resume_url: '',
  impressive_achievement: '',
  diagnostic_whats_working: '',
  diagnostic_improvements: '',
  diagnostic_missed_opportunity: '',
  campaign_name: '',
  campaign_concept: '',
  campaign_executions: '',
  budget_challenge: '',
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const totalSteps = 4

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    const updatedFields = Object.keys(data)
    setErrors((prev) => {
      const newErrors = { ...prev }
      updatedFields.forEach((field) => delete newErrors[field])
      return newErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!formData.full_name.trim()) newErrors.full_name = 'El nombre es requerido'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Ingresa un correo válido'
        }
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido'
        if (!formData.university) newErrors.university = 'Selecciona tu universidad'
        if (!formData.impressive_achievement.trim()) newErrors.impressive_achievement = 'Este campo es requerido'
        break
      case 1:
        if (!formData.diagnostic_whats_working.trim()) newErrors.diagnostic_whats_working = 'Este campo es requerido'
        if (!formData.diagnostic_improvements.trim()) newErrors.diagnostic_improvements = 'Este campo es requerido'
        if (!formData.diagnostic_missed_opportunity.trim()) newErrors.diagnostic_missed_opportunity = 'Este campo es requerido'
        break
      case 2:
        if (!formData.campaign_name.trim()) newErrors.campaign_name = 'El nombre de la campaña es requerido'
        if (!formData.campaign_concept.trim()) newErrors.campaign_concept = 'El concepto es requerido'
        if (!formData.campaign_executions.trim()) newErrors.campaign_executions = 'Las ejecuciones son requeridas'
        break
      case 3:
        if (!formData.budget_challenge.trim()) newErrors.budget_challenge = 'Tu respuesta es requerida'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      const applicationData: CandidateApplication = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        portfolio_link: formData.portfolio_link || undefined,
        resume_url: formData.resume_url || undefined,
        impressive_achievement: formData.impressive_achievement,
        diagnostic_whats_working: formData.diagnostic_whats_working,
        diagnostic_improvements: formData.diagnostic_improvements,
        diagnostic_missed_opportunity: formData.diagnostic_missed_opportunity,
        campaign_name: formData.campaign_name,
        campaign_concept: formData.campaign_concept,
        campaign_executions: formData.campaign_executions,
        budget_challenge: formData.budget_challenge,
      }

      await submitApplication(applicationData)
      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Hubo un error al enviar tu aplicación. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return <SuccessScreen />
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/logo_dosmicos.png"
              alt="Dosmicos"
              width={140}
              height={56}
              className="mx-auto mb-12"
              priority
            />

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-900 tracking-tight mb-6">
              Únete al equipo
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto font-light">
              Buscamos mentes creativas para el equipo de marketing de la marca de ropa infantil de más rápido crecimiento en Colombia.
            </p>
          </motion.div>

          {/* Stats */}
          <StatsDisplay />
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <div className="mt-12">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <FormStep1 key="step1" formData={formData} updateFormData={updateFormData} errors={errors} />
              )}
              {currentStep === 1 && (
                <FormStep2 key="step2" formData={formData} updateFormData={updateFormData} errors={errors} />
              )}
              {currentStep === 2 && (
                <FormStep3 key="step3" formData={formData} updateFormData={updateFormData} errors={errors} />
              )}
              {currentStep === 3 && (
                <FormStep4 key="step4" formData={formData} updateFormData={updateFormData} errors={errors} />
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-neutral-100">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-all
                ${currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-full
                hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                  Enviando...
                </>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  Enviar aplicación
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  Continuar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-neutral-400">
            ¿Preguntas?{' '}
            <a href="mailto:julian@dosmicos.co" className="text-neutral-600 hover:text-neutral-900 link-underline">
              julian@dosmicos.co
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
