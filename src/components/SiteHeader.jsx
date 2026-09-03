import { motion } from 'framer-motion'

export default function SiteHeader({ subtitle = 'Elige una actividad del acuario mágico.' }) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-10 text-center sm:pt-14">
      <motion.p
        className="mb-3 text-xs font-semibold tracking-[0.35em] text-cyan-200/80 uppercase"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Acuario Mágico
      </motion.p>
      <motion.h1
        className="font-display text-5xl font-semibold text-cyan-50 drop-shadow-[0_0_28px_rgba(125,211,252,0.55)] sm:text-6xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Multi Aquarium
      </motion.h1>
      <motion.p
        className="mt-3 max-w-xl text-sm text-sky-100/80 sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    </header>
  )
}
