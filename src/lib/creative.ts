export const profiles = ['Realización / edición audiovisual', 'Guion / comunicación digital'] as const
export interface CreativeForm {
  full_name: string; email: string; phone: string; university: string; program: string
  profile: string; eligibility: string; start_date: string; onsite: string; schedule: string; availability_notes: string
  portfolio_link: string; resume_url: string; work1_url: string; work1_contribution: string; work2_url: string; work2_contribution: string
}
export const emptyCreativeForm: CreativeForm = {
  full_name: '', email: '', phone: '', university: '', program: '', profile: '', eligibility: '', start_date: '', onsite: '', schedule: '', availability_notes: '',
  portfolio_link: '', resume_url: '', work1_url: '', work1_contribution: '', work2_url: '', work2_contribution: ''
}
export function isWebUrl(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password } catch { return false }
}
export function validateCreativeStep(data: CreativeForm, step: number) {
  const errors: Record<string, string> = {}
  const required = step === 0 ? ['profile', 'full_name', 'email', 'phone', 'university', 'program'] : step === 1 ? ['eligibility', 'start_date', 'onsite', 'schedule'] : ['work1_url', 'work1_contribution', 'work2_url', 'work2_contribution']
  for (const field of required as (keyof CreativeForm)[]) if (!data[field].trim()) errors[field] = 'Completa este campo'
  if (step === 0) {
    if (!profiles.includes(data.profile as typeof profiles[number])) errors.profile = 'Selecciona un perfil'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Ingresa un correo válido'
    if (!/^\+?[\d\s()-]{7,20}$/.test(data.phone.trim()) || data.phone.replace(/\D/g, '').length < 7) errors.phone = 'Ingresa un teléfono válido'
  }
  if (step === 1) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.start_date) || !Number.isFinite(Date.parse(data.start_date)) || new Date(data.start_date).toISOString().slice(0,10) !== data.start_date) errors.start_date = 'Selecciona una fecha válida'
    if (data.start_date < '2026-11-01' || data.start_date > '2027-01-31') errors.start_date = 'El ingreso previsto es entre noviembre de 2026 y enero de 2027'
    if ((data.schedule === 'Necesito ajustes por estudios' || data.eligibility === 'Pendiente de confirmar') && !data.availability_notes.trim()) errors.availability_notes = 'Cuéntanos los ajustes o requisitos pendientes'
  }
  if (step === 2) {
    for (const field of ['portfolio_link', 'work1_url', 'work2_url'] as const) if (data[field] && !isWebUrl(data[field].trim())) errors[field] = 'Usa un enlace completo http o https'
    if (!data.resume_url && !data.portfolio_link.trim()) errors.portfolio_link = 'Adjunta tu CV o comparte tu portafolio (puedes incluir ambos)'
  }
  return errors
}
export function creativeDetails(data: CreativeForm) {
  return {
    version: 'creative-2026-v1', profile: data.profile, program: data.program.trim(), eligibility: data.eligibility,
    start_date: data.start_date, onsite: data.onsite, schedule: data.schedule, availability_notes: data.availability_notes.trim(),
    works: [{ url: data.work1_url.trim(), contribution: data.work1_contribution.trim() }, { url: data.work2_url.trim(), contribution: data.work2_contribution.trim() }]
  }
}
export type CreativeDetails = ReturnType<typeof creativeDetails>
export function isCreativeDetails(value: unknown): value is CreativeDetails {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return data.version === 'creative-2026-v1' && ['profile', 'program', 'eligibility', 'start_date', 'onsite', 'schedule', 'availability_notes'].every(key => typeof data[key] === 'string') && Array.isArray(data.works) && data.works.length === 2 && data.works.every(work => !!work && typeof work === 'object' && typeof work.url === 'string' && typeof work.contribution === 'string')
}
export function creativeSummary(data: CreativeDetails) {
  return [`Perfil: ${data.profile}`, `Programa: ${data.program}`, `Habilitación: ${data.eligibility}`, `Inicio: ${data.start_date}`, `Presencial Bogotá: ${data.onsite}`, `Horario: ${data.schedule}`, `Compatibilidad académica: ${data.availability_notes || 'Sin ajustes indicados'}`, ...data.works.map((work, i) => `Trabajo ${i + 1}: ${work.url}\nAporte personal: ${work.contribution}`)].join('\n')
}
// A stable primary key gives retries and repeat submissions the same identity, without reading candidates.
export async function creativeApplicationId(email: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`dosmicos:creative-2026-v1:${email.trim().toLowerCase()}`)))
  bytes[6] = (bytes[6] & 15) | 80; bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes.slice(0,16), byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}
