import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'

function createBubbles(count) {
  return Array.from({ length: count }, (_, index) => {
    const size = 6 + ((index * 13) % 22)
    return {
      id: index,
      left: `${(index * 17 + 8) % 96}%`,
      size,
      delay: (index * 0.45) % 8,
      duration: 10 + (index % 7) * 2.4,
      opacity: 0.18 + (index % 5) * 0.08,
    }
  })
}

export default function AquariumBackground() {
  const bubbles = useMemo(() => createBubbles(22), [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(56,189,248,0.28),transparent_52%),radial-gradient(ellipse_at_85%_15%,rgba(29,78,216,0.38),transparent_48%),linear-gradient(180deg,#0c4a6e_0%,#0a365c_22%,#072844_52%,#041018_100%)]" />
      <div className="light-rays absolute -inset-x-20 -top-10 h-[70vh]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(2,12,28,0.75),transparent_55%)]" />

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.span
            key={bubble.id}
            className="absolute bottom-[-40px] rounded-full border border-cyan-100/40 bg-gradient-to-b from-white/40 to-cyan-200/10"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              opacity: bubble.opacity,
            }}
            initial={{ y: 0, scale: 0.7 }}
            animate={{ y: -1100, scale: 1, x: [0, 12, -8, 0] }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </AnimatePresence>

      <svg
        className="absolute bottom-0 left-0 h-40 w-full text-cyan-900/70"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="seaweed"
          fill="currentColor"
          d="M80 180c8-40 4-70-10-110 22 18 34 52 28 110H80z"
        />
        <path
          className="seaweed seaweed-slow"
          fill="currentColor"
          d="M180 180c12-48 2-88-18-140 32 24 48 70 40 140H180z"
        />
        <path
          className="seaweed"
          fill="currentColor"
          d="M1260 180c-10-44-4-78 12-122-26 20-38 58-32 122h20z"
        />
        <path
          className="seaweed seaweed-slow"
          fill="currentColor"
          d="M1360 180c-14-52-2-92 20-148-36 26-52 76-44 148h24z"
        />
      </svg>
    </div>
  )
}
