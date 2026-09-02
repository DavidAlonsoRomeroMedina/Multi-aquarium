import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function SuccessMessage({ onReset }) {
  return (
    <GlassCard className="w-full max-w-xl text-center">
      <motion.div
        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-100/30 bg-cyan-300/15 text-4xl"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      >
        ✦
      </motion.div>
      <h2 className="font-display text-3xl text-cyan-50">Tu carta ya flota en el acuario</h2>
      <p className="mt-3 text-sky-100/80">
        El mensaje se deslizó entre burbujas y llegará a su destinatario. Gracias por
        cuidar este rincón secreto.
      </p>
      <motion.button
        type="button"
        className="mt-6 rounded-2xl bg-cyan-300/20 px-5 py-3 font-semibold text-cyan-50 hover:bg-cyan-300/30"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
      >
        Enviar otra carta
      </motion.button>
    </GlassCard>
  )
}
