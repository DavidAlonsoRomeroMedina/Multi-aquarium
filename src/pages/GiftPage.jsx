import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import HeartPetals from '../components/HeartPetals'
import NightSky from '../components/NightSky'
import { LETTER } from '../constants/letter'
import useGift from '../hooks/useGift'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function WaitingScreen() {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-16">
      <div className="paper w-full rounded-3xl px-8 py-12 text-center">
        <p className="text-xs font-semibold tracking-[0.32em] text-rose-800/70 uppercase">
          Pronto
        </p>
        <h1 className="font-display mt-3 text-4xl text-rose-950">Aún no es el momento</h1>
        <p className="mt-4 text-rose-900/80">
          Hay algo esperándote. Vuelve un poco más tarde, con el corazón
          despacito.
        </p>
      </div>
    </div>
  )
}

function Envelope({ onOpen, opening }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <motion.p
        className="font-script mb-3 text-3xl text-rose-100/90 sm:text-4xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {LETTER.kicker}
      </motion.p>
      <motion.p
        className="mb-8 max-w-sm text-center text-sm text-rose-100/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Hay una carta con tu nombre. Toca el sello para abrirla.
      </motion.p>

      <motion.button
        type="button"
        className="envelope-stage"
        onClick={onOpen}
        disabled={opening}
        aria-label="Abrir la carta de Abril"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 120, damping: 16 }}
        whileHover={opening ? undefined : { y: -6 }}
        whileTap={opening ? undefined : { scale: 0.98 }}
      >
        <div className={`envelope ${opening ? 'is-open' : ''}`}>
          <div className="envelope-pocket" />
          <div className="envelope-letter-peek">
            <span className="font-script text-2xl text-rose-900">{LETTER.envelopeLine}</span>
          </div>
          <div className="envelope-flap" />
          <span className="envelope-front-name font-script">{LETTER.envelopeLine}</span>
          <span className={`wax-seal ${opening ? 'is-broken' : ''}`}>
            <span className="wax-heart">♥</span>
          </span>
        </div>
      </motion.button>

      <p className="mt-8 text-xs tracking-[0.28em] text-rose-100/55 uppercase">
        Feliz cumpleaños
      </p>
    </div>
  )
}

function OpenedLetter({ onClose }) {
  return (
    <motion.div
      className="relative z-10 mx-auto w-full max-w-2xl px-4 py-10 pb-24 sm:py-16"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <article className="paper w-full rounded-[28px] px-6 py-8 sm:px-12 sm:py-12">
        <p className="text-xs font-semibold tracking-[0.34em] text-rose-800/65 uppercase">
          {LETTER.kicker}
        </p>
        <h1 className="font-script mt-3 text-4xl leading-tight text-rose-900 sm:text-5xl">
          {LETTER.title}
        </h1>
        <p className="font-display mt-2 text-xl italic text-rose-800/80">
          Querida {LETTER.recipient},
        </p>

        <div className="font-display mt-6 space-y-5 text-[1.15rem] leading-8 text-rose-950/90 sm:text-[1.25rem] sm:leading-9">
          {LETTER.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <p className="font-display mt-8 text-lg italic text-rose-900/85">{LETTER.closing}</p>
        <p className="font-script mt-2 text-4xl text-rose-900">{LETTER.signature}</p>
        <p className="mt-6 text-sm text-rose-800/70">{LETTER.postscript}</p>

        <button
          type="button"
          className="mt-8 rounded-full border border-rose-900/15 bg-rose-900/5 px-5 py-2 text-sm text-rose-900/80 hover:bg-rose-900/10"
          onClick={onClose}
        >
          Volver a guardar la carta
        </button>
      </article>
    </motion.div>
  )
}

export default function GiftPage() {
  const { enabled } = useGift()
  const [phase, setPhase] = useState('closed')

  useEffect(() => {
    document.title = 'Para Abril'
  }, [])

  function openLetter() {
    if (phase !== 'closed') return
    if (prefersReducedMotion()) {
      setPhase('reading')
      return
    }
    setPhase('opening')
    window.setTimeout(() => setPhase('reading'), 1500)
  }

  return (
    <>
      <NightSky />
      <HeartPetals />
      {!enabled ? (
        <WaitingScreen />
      ) : (
        <AnimatePresence mode="wait">
          {phase === 'reading' ? (
            <OpenedLetter key="letter" onClose={() => setPhase('closed')} />
          ) : (
            <motion.div key="envelope" exit={{ opacity: 0, scale: 0.96 }}>
              <Envelope onOpen={openLetter} opening={phase === 'opening'} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}
