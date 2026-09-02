import { motion } from 'framer-motion'
import { useMemo } from 'react'

function createBubbles(count) {
  return Array.from({ length: count }, (_, index) => {
    const size = 10 + ((index * 17) % 34)
    return {
      id: index,
      left: `${(index * 11 + 3) % 97}%`,
      size,
      delay: (index * 0.55) % 10,
      duration: 12 + (index % 8) * 2.2,
      opacity: 0.22 + (index % 5) * 0.1,
      blur: index % 4 === 0 ? 1.2 : 0,
    }
  })
}

function createSparkles(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `spark-${index}`,
    left: `${(index * 19 + 7) % 100}%`,
    top: `${(index * 13 + 5) % 80}%`,
    delay: (index * 0.4) % 6,
    size: 2 + (index % 3),
  }))
}

export default function AquariumBackground() {
  const bubbles = useMemo(() => createBubbles(28), [])
  const sparkles = useMemo(() => createSparkles(18), [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: "url('/fondo/cuarto-acuario.png')" }}
      />
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 mix-blend-screen"
        style={{ backgroundImage: "url('/fondo/bosque-burbujas.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,211,252,0.35),transparent_45%),radial-gradient(ellipse_at_80%_30%,rgba(56,189,248,0.25),transparent_40%),linear-gradient(180deg,rgba(8,47,73,0.35)_0%,rgba(2,20,40,0.55)_45%,rgba(2,12,28,0.82)_100%)]" />
      <div className="light-rays absolute -inset-x-16 -top-8 h-[75vh]" />

      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
            boxShadow: '0 0 10px rgba(186,230,253,0.9)',
          }}
          animate={{ opacity: [0.15, 0.95, 0.2], scale: [0.7, 1.3, 0.8] }}
          transition={{
            duration: 3.4,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.id}
          className="absolute bottom-[-50px] rounded-full border border-cyan-100/50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),rgba(125,211,252,0.12)_45%,rgba(8,47,73,0.05)_100%)] shadow-[0_0_20px_rgba(103,232,249,0.25)]"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            filter: bubble.blur ? `blur(${bubble.blur}px)` : undefined,
          }}
          initial={{ y: 0, scale: 0.65 }}
          animate={{ y: -1200, scale: 1.05, x: [0, 18, -14, 0] }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#02101c] to-transparent" />
    </div>
  )
}
