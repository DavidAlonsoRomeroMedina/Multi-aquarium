import { motion } from 'framer-motion'
import { useMemo } from 'react'

function createBubbles(count) {
  return Array.from({ length: count }, (_, index) => {
    const size = 10 + ((index * 17) % 34)
    return {
      id: `bubble-${index}`,
      left: `${(index * 11 + 3) % 97}%`,
      size,
      delay: (index * 0.55) % 10,
      duration: 12 + (index % 8) * 2.2,
      opacity: 0.22 + (index % 5) * 0.1,
      blur: index % 4 === 0 ? 1.2 : 0,
    }
  })
}

function createPetals(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `petal-${index}`,
    left: `${(index * 9 + 3) % 98}%`,
    delay: (index * 0.35) % 8,
    duration: 9 + (index % 6) * 1.6,
    size: 12 + (index % 5) * 4,
    drift: index % 2 === 0 ? 28 : -24,
    char: index % 3 === 0 ? '❀' : '✿',
  }))
}

export default function EnamoraAtmosphere() {
  const bubbles = useMemo(() => createBubbles(18), [])
  const petals = useMemo(() => createPetals(16), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.id}
          className="absolute bottom-[-40px] rounded-full border border-cyan-100/50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),rgba(125,211,252,0.12)_45%,rgba(8,47,73,0.05)_100%)] shadow-[0_0_16px_rgba(103,232,249,0.22)]"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            filter: bubble.blur ? `blur(${bubble.blur}px)` : undefined,
          }}
          initial={{ y: 0, scale: 0.7 }}
          animate={{ y: -1200, scale: 1.05, x: [0, 16, -12, 0] }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {petals.map((petal) => (
        <motion.span
          key={petal.id}
          className="absolute top-[-30px] text-pink-300 drop-shadow"
          style={{ left: petal.left, fontSize: petal.size }}
          initial={{ y: 0, rotate: 0, opacity: 0.2 }}
          animate={{
            y: 1100,
            rotate: [0, 40, -25, 15],
            x: [0, petal.drift, 0],
            opacity: [0.25, 0.95, 0.3],
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
