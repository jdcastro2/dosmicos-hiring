import { NextRequest } from 'next/server'
import { privateJson, requireHiringAdmin } from '@/lib/admin-server'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const access = await requireHiringAdmin(request)
  return access.error || privateJson({ authorized: true })
}
