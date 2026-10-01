export const profiles = ['Realización / edición audiovisual', 'Guion / comunicación digital'] as const
export const achievementQuestion = '¿Qué es lo más impresionante que has construido, organizado o logrado FUERA de la universidad y de las notas académicas?'
export interface CreativeForm {
  full_name: string; email: string; profile: string; resume_url: string; impressive_achievement: string; portfolio_link: string
}
export const emptyCreativeForm: CreativeForm = {full_name:'',email:'',profile:'',resume_url:'',impressive_achievement:'',portfolio_link:''}
export function isWebUrl(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password } catch { return false }
}
export function validateCreativeForm(data: CreativeForm) {
  const errors: Record<string, string> = {}
  for (const field of ['full_name','email','profile','impressive_achievement'] as const) if (!data[field].trim()) errors[field] = 'Completa este campo'
  if (!profiles.includes(data.profile as typeof profiles[number])) errors.profile = 'Selecciona un perfil'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Ingresa un correo válido'
  if (!data.resume_url) errors.resume_url = 'Adjunta tu hoja de vida'
  if (data.portfolio_link.trim() && !isWebUrl(data.portfolio_link.trim())) errors.portfolio_link = 'Usa un enlace completo http o https'
  return errors
}
export function creativeDetails(data: CreativeForm) { return {version:'creative-2026-brief-v2' as const,profile:data.profile} }
export type BriefCreativeDetails = ReturnType<typeof creativeDetails>
export interface LegacyCreativeDetails {
  version:'creative-2026-v1';profile:string;program:string;eligibility:string;start_date:string;onsite:string;schedule:string;availability_notes:string
  works:{url:string;contribution:string}[]
}
export type CreativeDetails = BriefCreativeDetails | LegacyCreativeDetails
export function isCreativeDetails(value: unknown): value is CreativeDetails {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  if (data.version === 'creative-2026-brief-v2') return typeof data.profile === 'string'
  return data.version === 'creative-2026-v1' && ['profile', 'program', 'eligibility', 'start_date', 'onsite', 'schedule', 'availability_notes'].every(key => typeof data[key] === 'string') && Array.isArray(data.works) && data.works.length === 2 && data.works.every(work => !!work && typeof work === 'object' && typeof work.url === 'string' && typeof work.contribution === 'string')
}
export function creativeSummary(data: CreativeDetails) {
  if (data.version === 'creative-2026-brief-v2') return `Perfil: ${data.profile}`
  return [`Perfil: ${data.profile}`, `Programa: ${data.program}`, `Habilitación: ${data.eligibility}`, `Inicio: ${data.start_date}`, `Presencial Bogotá: ${data.onsite}`, `Horario: ${data.schedule}`, `Compatibilidad académica: ${data.availability_notes || 'Sin ajustes indicados'}`, ...data.works.map((work, i) => `Trabajo ${i + 1}: ${work.url}\nAporte personal: ${work.contribution}`)].join('\n')
}
// Stable identity for this campaign: retries never read or overwrite candidates.
export async function creativeApplicationId(email: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`dosmicos:creative-2026-v1:${email.trim().toLowerCase()}`)))
  bytes[6] = (bytes[6] & 15) | 80; bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes.slice(0,16), byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}
