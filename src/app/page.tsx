'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import SuccessScreen from '@/components/SuccessScreen'
import CreativeFields from '@/components/CreativeFields'
import { CreativeForm, emptyCreativeForm, validateCreativeForm, creativeDetails, creativeApplicationId } from '@/lib/creative'
import { submitApplication, uploadResume, CandidateApplication } from '@/lib/supabase'

export default function Home() {
  const [formData, setFormData] = useState<CreativeForm>(emptyCreativeForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const submitting = useRef(false), uploading = useRef(false)
  const updateFormData = (data: Partial<CreativeForm>) => {
    setFormData(prev => ({...prev,...data}))
    setErrors(prev => { const next = {...prev}; Object.keys(data).forEach(key => delete next[key]); return next })
  }
  const handleUpload = async (file: File) => {
    if (uploading.current || submitting.current) return
    if (file.size > 5 * 1024 * 1024 || !['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setMessage('Selecciona un archivo PDF o Word de máximo 5 MB.'); return
    }
    uploading.current = true; setIsUploading(true); setMessage('')
    try {
      const url = await uploadResume(file, `${crypto.randomUUID()}.${file.name.split('.').pop()}`)
      updateFormData({resume_url:url});setFileName(file.name)
    } catch { setMessage('No se pudo subir el archivo. Intenta de nuevo.') }
    finally { uploading.current = false;setIsUploading(false) }
  }
  const handleSubmit = async () => {
    if (submitting.current || uploading.current) return
    const nextErrors = validateCreativeForm(formData);setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.getElementById(Object.keys(nextErrors)[0] === 'resume_url' ? 'resume-upload' : Object.keys(nextErrors)[0])?.focus());return
    }
    submitting.current = true;setIsSubmitting(true);setMessage('')
    try {
      const applicationData: CandidateApplication = {
        id:await creativeApplicationId(formData.email),full_name:formData.full_name.trim(),email:formData.email.trim().toLowerCase(),
        resume_url:formData.resume_url,portfolio_link:formData.portfolio_link.trim() || undefined,
        impressive_achievement:formData.impressive_achievement.trim(),creative_application:creativeDetails(formData),
        phone:'',university:formData.university.trim(),diagnostic_whats_working:'',diagnostic_improvements:'',diagnostic_missed_opportunity:'',campaign_name:'',campaign_concept:'',campaign_executions:'',budget_challenge:''
      }
      await submitApplication(applicationData);setIsSuccess(true)
    } catch { setMessage('No pudimos confirmar el envío. Reintenta con el mismo correo: evitaremos duplicar tu postulación. Tus datos siguen en el formulario.') }
    finally { submitting.current = false;setIsSubmitting(false) }
  }
  if (isSuccess) return <SuccessScreen />
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
              Prácticas creativas
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto font-light">
              Dosmicos es una marca colombiana de ropa infantil que combina diseño, personajes e historias con IA y tecnología. Estamos creciendo mucho y buscamos talento creativo que quiera crecer con nosotros
            </p>
          </motion.div>

          {/* Stats */}
          <div className="max-w-2xl mx-auto mt-8 text-neutral-600 space-y-4 text-center">
            <p>Nuestra aspiración: llevar Dosmicos al mundo con una expansión global.</p>
            <div className="bg-neutral-50 rounded-2xl p-6 text-left space-y-3 text-sm">
              <p><strong>Dos cupos totales:</strong> realización / edición audiovisual y guion / comunicación digital.</p>
              <p><strong>Presencial en Bogotá.</strong> COP 2.000.000 mensuales recibidos por persona; los costos de empresa van aparte.</p>
              <p><strong>Ingreso:</strong> noviembre de 2026–enero de 2027.</p>
              <p><strong>Horario:</strong> lunes a viernes, 08:00–17:00, sujeto a compatibilidad académica y descansos.</p>
              <p><strong>Líder directo:</strong> Julián Castro. La duración se acuerda según la universidad.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.6}}>
          <form noValidate onSubmit={e => {e.preventDefault();void handleSubmit()}}>
            <fieldset disabled={isSubmitting || isUploading}>
              <CreativeFields data={formData} update={updateFormData} errors={errors} upload={handleUpload} uploading={isUploading} fileName={fileName}/>
              {message && <p role="alert" className="mt-6 text-red-700">{message}</p>}
              <div className="flex justify-end mt-10 pt-8 border-t border-neutral-100">
                <button type="submit" disabled={isSubmitting || isUploading} className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Enviando…' : 'Enviar postulación'}</button>
              </div>
            </fieldset>
          </form>
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
