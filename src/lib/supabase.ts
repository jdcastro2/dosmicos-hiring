import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// El formulario público siempre opera como anon, incluso con una sesión admin abierta.
const publicFormClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { storageKey: 'hiring-public-form', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

export interface CandidateApplication {
  id?: string
  created_at?: string

  // Step 1: Personal Info
  full_name: string
  email: string
  phone: string
  university: string
  portfolio_link?: string
  resume_url?: string
  impressive_achievement: string

  // Step 2: Diagnostic
  diagnostic_whats_working: string
  diagnostic_improvements: string
  diagnostic_missed_opportunity: string

  // Step 3: Campaign Concept
  campaign_name: string
  campaign_concept: string
  campaign_executions: string

  // Step 4: Open Question
  budget_challenge: string
}

export async function uploadResume(file: File, fileName: string): Promise<string> {
  // Limpiar el nombre del archivo: remover acentos, caracteres especiales y espacios
  const cleanFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales con guión bajo
    .replace(/_+/g, '_') // Evitar múltiples guiones bajos seguidos

  const { data, error } = await publicFormClient.storage
    .from('resumes')
    .upload(cleanFileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading resume:', error)
    throw error
  }

  const { data: urlData } = publicFormClient.storage
    .from('resumes')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function submitApplication(data: CandidateApplication) {
  const { data: result, error } = await publicFormClient
    .from('applications')
    .insert([data])


  if (error) {
    console.error('Error submitting application:', error)
    throw error
  }

  return result
}

export async function getApplications(): Promise<CandidateApplication[]> {
  const { adminRequest } = await import('./auth')
  return adminRequest<CandidateApplication[]>('/api/admin/applications')
}
export async function getApplicationById(id: string): Promise<CandidateApplication | null> {
  return (await getApplications()).find(app => app.id === id) || null
}
export async function getResumeLink(id: string): Promise<string> {
  const { adminRequest } = await import('./auth')
  const result = await adminRequest<{ url: string }>(`/api/admin/applications/${encodeURIComponent(id)}/resume`)
  return result.url
}
