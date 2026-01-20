'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function SuccessScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 overflow-hidden relative">
      {/* Rocket GIF */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/Cohete.gif"
          alt="Rocket Launch"
          fill
          className="object-cover"
          unoptimized
        />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-lg w-full text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image
            src="/logo_dosmicos.png"
            alt="Dosmicos"
            width={120}
            height={48}
            className="mx-auto"
          />
        </motion.div>

        {/* Main message */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Aplicación enviada
        </motion.h1>

        {/* Elon quote */}
        <motion.div
          className="mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl md:text-2xl text-neutral-600 font-light italic mb-4">
            &ldquo;When something is important enough, you do it even if the odds are not in your favor.&rdquo;
          </p>
          <p className="text-neutral-400 text-sm">— Elon Musk</p>
        </motion.div>

        {/* Status */}
        <motion.div
          className="bg-neutral-100 rounded-2xl p-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 text-neutral-900">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">Te contactaremos en 48-72 horas</span>
          </div>
        </motion.div>

        {/* Instagram link */}
        <motion.a
          href="https://instagram.com/dosmicos.co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-full
            hover:bg-neutral-800 transition-all"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Síguenos en Instagram
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.a>
      </motion.div>
    </div>
  )
}
