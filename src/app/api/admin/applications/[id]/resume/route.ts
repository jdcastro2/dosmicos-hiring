import { NextRequest } from 'next/server'
import { privateJson, requireHiringAdmin } from '@/lib/admin-server'
import { resumePath } from '@/lib/admin-access'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireHiringAdmin(request)
  if (access.error) return access.error
  const { id } = await context.params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return privateJson({ error: 'Identificador inválido' }, 400)
  const { data, error } = await access.client.from('applications').select('resume_url').eq('id', id).maybeSingle()
  if (error) return privateJson({ error: 'No se pudo consultar el CV' }, 502)
  if (!data?.resume_url) return privateJson({ error: 'CV no disponible' }, 404)
  const path = resumePath(data.resume_url, process.env.NEXT_PUBLIC_SUPABASE_URL!)
  if (!path) return privateJson({ error: 'Ubicación de CV no compatible' }, 422)
  const { data: signed, error: signingError } = await access.client.storage.from('resumes').createSignedUrl(path, 60)
  if (signingError || !signed) return privateJson({ error: 'No se pudo abrir el CV' }, 502)
  return privateJson({ url: signed.signedUrl, expiresIn: 60 })
}
