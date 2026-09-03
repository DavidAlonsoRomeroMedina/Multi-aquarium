import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import LetterForm from '../components/LetterForm'
import SiteHeader from '../components/SiteHeader'
import SuccessMessage from '../components/SuccessMessage'
import useMembers from '../hooks/useMembers'

export default function HomePage() {
  const { members, loading, error } = useMembers()
  const [sent, setSent] = useState(false)

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-16">
      <SiteHeader subtitle="Admirador Secreto — deja una carta flotar hasta alguien del grupo." />
      <Link to="/" className="mt-3 text-sm text-cyan-100 underline-offset-4 hover:underline">
        Volver a actividades
      </Link>

      <motion.main
        className="mt-10 flex w-full justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <SuccessMessage onReset={() => setSent(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="w-full max-w-4xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {error ? (
                <p className="mb-4 rounded-2xl border border-amber-200/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  {error}
                </p>
              ) : null}
              {loading ? (
                <p className="mb-4 text-center text-sm text-cyan-100/70">
                  Cargando integrantes del acuario…
                </p>
              ) : null}
              <LetterForm members={members} onSent={() => setSent(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
