import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import LoveThermometer from '../components/LoveThermometer'
import SiteHeader from '../components/SiteHeader'
import { phraseForLovePercent, isExtremeLoveScore } from '../constants/lovePhrases'
import { getMemberImage } from '../constants/members'
import { db, isFirebaseConfigured } from '../firebase'
import useMembers from '../hooks/useMembers'

function MemberSlot({ label, members, selectedId, onChange }) {
  const selected = members.find((member) => member.id === selectedId)

  return (
    <div className="flex w-full max-w-[220px] flex-col items-center gap-3">
      <span className="avatar-ring h-28 w-28 overflow-hidden rounded-full border-pink-200/70">
        {selected?.image || selected?.name ? (
          <img
            src={getMemberImage(selected.name, selected.image)}
            alt={selected.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-pink-100">?</span>
        )}
      </span>
      <label className="w-full text-center text-xs font-semibold tracking-wide text-pink-100 uppercase">
        {label}
      </label>
      <select
        className="glass-input text-sm"
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Elige un integrante…</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Enamora2Page() {
  const { members } = useMembers()
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  const left = members.find((member) => member.id === leftId)
  const right = members.find((member) => member.id === rightId)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return undefined

    return onSnapshot(
      query(collection(db, 'loveMatches'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setHistory(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .filter((item) => isExtremeLoveScore(item.percent))
            .slice(0, 24),
        )
      },
      (err) => console.error(err),
    )
  }, [])

  const canContinue = Boolean(left && right && left.id !== right.id)

  async function handleContinue() {
    if (!canContinue) {
      setError('Elige a dos integrantes distintos.')
      return
    }

    const percent = Math.floor(Math.random() * 101)
    const phrase = phraseForLovePercent(percent)
    setError('')
    setResult({ percent, phrase })

    if (!isExtremeLoveScore(percent) || !db) return

    try {
      await addDoc(collection(db, 'loveMatches'), {
        leftName: left.name,
        leftImage: getMemberImage(left.name, left.image),
        rightName: right.name,
        rightImage: getMemberImage(right.name, right.image),
        percent,
        phrase,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const tilt = useMemo(() => {
    if (!left || !right) return 0
    return left.name.length > right.name.length ? -6 : 6
  }, [left, right])

  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 pb-16">
      <SiteHeader subtitle="Enamora2 — anónimo, infinito y un poco cruel." />
      <div className="mb-4 text-center">
        <Link to="/" className="text-sm text-pink-100 underline-offset-4 hover:underline">
          Volver a actividades
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <GlassCard className="overflow-hidden">
          <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <MemberSlot
              label="Integrante A"
              members={members}
              selectedId={leftId}
              onChange={setLeftId}
            />

            <div className="flex flex-col items-center">
              <motion.div
                className="relative h-3 w-48 rounded-full bg-pink-200/30"
                animate={{ rotate: tilt }}
              >
                <span className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-100/40 bg-pink-300/40" />
              </motion.div>
              <p className="mt-3 font-display text-2xl text-pink-50">Balanza</p>
            </div>

            <MemberSlot
              label="Integrante B"
              members={members}
              selectedId={rightId}
              onChange={setRightId}
            />
          </div>

          {error ? <p className="mb-4 text-center text-sm text-rose-100">{error}</p> : null}

          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-400 px-8 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(255,77,148,0.35)] disabled:opacity-50"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continuar
            </button>
          </div>

          <AnimatePresence>
            {result ? (
              <motion.div
                className="mt-10 flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <LoveThermometer percent={result.percent} />
                <p className="font-pixel text-center text-[11px] leading-6 text-pink-50">
                  {result.percent}%
                </p>
                <p className="font-display max-w-md text-center text-3xl text-pink-50">
                  {result.phrase}
                </p>
                <button
                  type="button"
                  className="text-sm text-pink-100 underline-offset-4 hover:underline"
                  onClick={() => setResult(null)}
                >
                  Probar otra pareja
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </GlassCard>

        <aside>
          <GlassCard className="lg:sticky lg:top-6">
            <h2 className="font-display text-2xl text-pink-50">Registro extremo</h2>
            <p className="mt-1 mb-4 text-xs text-pink-100/70">
              Solo se publican 0–10% y 90–100%.
            </p>
            <div className="custom-scroll max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-pink-100/70">Aún no hay destinos extremos.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-pink-100/15 bg-pink-500/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex -space-x-2">
                        <img
                          src={item.leftImage}
                          alt={item.leftName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <img
                          src={item.rightImage}
                          alt={item.rightName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </div>
                      <span className="font-pixel text-[10px] text-pink-50">{item.percent}%</span>
                    </div>
                    <p className="mt-2 text-sm text-pink-50">
                      {item.leftName} + {item.rightName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  )
}
