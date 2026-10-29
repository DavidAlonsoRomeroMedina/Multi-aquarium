import { motion } from 'framer-motion'
import { useMemo } from 'react'

function createPetals(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `petal-${index}`,
    left: `${(index * 9 + 4) % 98}%`,
    delay: (index * 0.4) % 9,
    duration: 10 + (index % 6) * 1.8,
    size: 14 + (index % 5) * 5,
    drift: index % 2 === 0 ? 32 : -26,
    char: index % 4 === 0 ? '♥' : index % 3 === 0 ? '❀' : '✿',
    color: index % 4 === 0 ? '#f4b8c5' : index % 2 === 0 ? '#f7d6c8' : '#e8a0b4',
  }))
}

export default function HeartPetals() {
  const petals = useMemo(() => createPetals(18), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden="true">
      {petals.map((petal) => (
        <motion.span
          key={petal.id}
          className="absolute top-[-40px] drop-shadow"
          style={{ left: petal.left, fontSize: petal.size, color: petal.color }}
          initial={{ y: 0, rotate: 0, opacity: 0.15 }}
          animate={{
            y: 1100,
            rotate: [0, 35, -20, 18],
            x: [0, petal.drift, 0],
            opacity: [0.15, 0.85, 0.2],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {petal.char}
        </motion.span>
      ))}
    </div>
  )
}
