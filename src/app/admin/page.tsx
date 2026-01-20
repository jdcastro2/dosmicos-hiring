'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { validateAdmin, setAuthToken, isAuthenticated } from '@/lib/auth'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (validateAdmin(email, password)) {
      setAuthToken('dosmicos_admin_authenticated')
      setIsLoggedIn(true)
    } else {
      setError('Credenciales incorrectas')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (isLoggedIn) {
    return <AdminDashboard />
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Image
            src="/logo_dosmicos.png"
            alt="Dosmicos"
            width={120}
            height={48}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-semibold text-neutral-900">
            Panel de Administración
          </h1>
          <p className="text-neutral-500 mt-2">Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200
                focus:border-neutral-900 focus:outline-none transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200
                focus:border-neutral-900 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              className="text-red-500 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-medium rounded-lg
              hover:bg-neutral-800 transition-all"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400 mt-6">
          <a href="/" className="hover:text-neutral-600 transition-colors">
            ← Volver al inicio
          </a>
        </p>
      </motion.div>
    </div>
  )
}
