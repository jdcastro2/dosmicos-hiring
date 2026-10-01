import { supabase } from './supabase'
import { isHiringAdmin } from './admin-access'

export async function isAuthenticated(): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser()
  return !error && isHiringAdmin(data.user)
}
export async function loginAdmin(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error('No se pudo iniciar sesión con tu cuenta de Supabase')
  if (!isHiringAdmin(data.user)) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Esta cuenta no tiene acceso al panel')
  }
}
export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' })
  // El token heredado ya no autoriza; retirarlo del navegador anterior.
  localStorage.removeItem('admin_token')
}
export async function adminRequest<T>(path: string): Promise<T> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Inicia sesión nuevamente')
  const response = await fetch(path, { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store' })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await logoutAdmin()
      window.location.assign('/admin')
      throw new Error('Sesión no autorizada')
    }
    throw new Error('No se pudo completar la consulta. Intenta nuevamente.')
  }
  return response.json()
}
