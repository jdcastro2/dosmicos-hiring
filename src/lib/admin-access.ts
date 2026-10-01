// Identidad existente autorizada exclusivamente para Dosmicos Hiring.
export const HIRING_ADMIN_ID = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'
export const HIRING_ADMIN_EMAIL = 'julian@dosmicos.co'
export function isHiringAdmin(user: { id: string; email?: string } | null): boolean {
  return !!user && user.id === HIRING_ADMIN_ID && user.email?.toLowerCase() === HIRING_ADMIN_EMAIL
}

// Solo rutas del bucket existente en el mismo proyecto; nunca URLs externas.
export function resumePath(value: string, projectUrl: string): string | null {
  try {
    const url = new URL(value)
    if (url.origin !== new URL(projectUrl).origin || url.search || url.hash) return null
    const prefix = '/storage/v1/object/public/resumes/'
    if (!url.pathname.startsWith(prefix)) return null
    const path = decodeURIComponent(url.pathname.slice(prefix.length))
    if (!path || path.split('/').some(part => !part || part === '.' || part === '..') || /[\\\x00-\x1f]/.test(path)) return null
    return path
  } catch { return null }
}
