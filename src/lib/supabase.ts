import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading resume:', error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function submitApplication(data: CandidateApplication) {
  const { data: result, error } = await supabase
    .from('applications')
    .insert([data])
    .select()

  if (error) {
    console.error('Error submitting application:', error)
    throw error
  }

  return result
}

export async function getApplications(): Promise<CandidateApplication[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw error
  }

  return data || []
}

export async function getApplicationById(id: string): Promise<CandidateApplication | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching application:', error)
    return null
  }

  return data
}
