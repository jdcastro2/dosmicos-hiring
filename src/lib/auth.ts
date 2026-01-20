// Simple admin authentication
// In production, use a proper auth system like NextAuth or Supabase Auth

const ADMIN_EMAIL = 'julian@dosmicos.co'
const ADMIN_PASSWORD = 'Judacari.545'

export function validateAdmin(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export function setAuthToken(token: string): void {
  localStorage.setItem('admin_token', token)
}

export function removeAuthToken(): void {
  localStorage.removeItem('admin_token')
}

export function isAuthenticated(): boolean {
  const token = getAuthToken()
  return token === 'dosmicos_admin_authenticated'
}
