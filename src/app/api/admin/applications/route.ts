import { NextRequest } from 'next/server'
import { privateJson, requireHiringAdmin } from '@/lib/admin-server'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const access = await requireHiringAdmin(request)
  if (access.error) return access.error
  const { data, error } = await access.client.from('applications').select('*').order('created_at', { ascending: false })
  if (error) return privateJson({ error: 'No se pudieron cargar las postulaciones' }, 502)
  return privateJson(data || [])
}
