import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isHiringAdmin } from './admin-access'

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0', 'Vary': 'Authorization', 'X-Content-Type-Options': 'nosniff' } })
}

export async function requireHiringAdmin(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ') || authorization.length > 8192) return { error: privateJson({ error: 'Sesión requerida' }, 401) }
  const token = authorization.slice(7)
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  // getUser valida el token con Supabase Auth. Nunca confiar en claims del cliente.
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return { error: privateJson({ error: 'Sesión inválida' }, 401) }
  if (!isHiringAdmin(data.user)) return { error: privateJson({ error: 'Acceso no autorizado' }, 403) }
  return { client }
}
