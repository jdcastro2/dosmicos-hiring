'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {suffix === '%' ? '+' : ''}{count}{suffix}
    </span>
  )
}

export default function StatsDisplay() {
  const stats = [
    { value: 220, suffix: '%', label: 'Ventas' },
    { value: 6, suffix: 'x', label: 'ROAS' },
    { value: 1, suffix: '', label: 'Misión' },
  ]

  return (
    <motion.div
      className="flex justify-center items-center gap-8 md:gap-16 mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="text-center group cursor-default"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="relative">
            {index > 0 && (
              <div className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 w-px h-12 bg-neutral-200" />
            )}
            <motion.p
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight
                group-hover:text-neutral-700 transition-colors"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4 + index * 0.15,
                duration: 0.5,
                type: 'spring',
                stiffness: 100
              }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </motion.p>
            <motion.p
              className="text-sm md:text-base text-neutral-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.15 }}
            >
              {stat.label}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
