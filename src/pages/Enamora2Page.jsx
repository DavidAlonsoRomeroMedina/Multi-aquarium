import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import LoveThermometer from '../components/LoveThermometer'
import SiteHeader from '../components/SiteHeader'
import { isExtremeLoveScore, phraseForLovePercent } from '../constants/lovePhrases'
import { getMemberImage } from '../constants/members'
import { db, isFirebaseConfigured } from '../firebase'
import useMembers from '../hooks/useMembers'

function PartnerSlot({ label, member, onClear }) {
  return (
    <div className="flex w-40 flex-col items-center gap-2 sm:w-48">
      <span className="avatar-ring h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
        {member ? (
          <img
            src={getMemberImage(member.name, member.image)}
            alt={member.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-pink-100/70">
            ?
          </span>
        )}
      </span>
      <p className="text-xs font-semibold tracking-wide text-pink-100/80 uppercase">{label}</p>
      <p className="min-h-6 text-center font-medium text-pink-50">
        {member?.name || 'Pendiente'}
      </p>
      {member ? (
        <button type="button" className="text-xs text-pink-200/70 hover:text-pink-50" onClick={onClear}>
          Quitar
        </button>
      ) : null}
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
  const canContinue = Boolean(left && right && left.id !== right.id)

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

  function pickMember(id) {
    setError('')
    setResult(null)

    if (id === leftId) {
      setLeftId('')
      return
    }
    if (id === rightId) {
      setRightId('')
      return
    }
    if (!leftId) {
      setLeftId(id)
      return
    }
    if (!rightId) {
      setRightId(id)
    }
  }

  async function handleContinue() {
    if (!canContinue) {
      setError('Elige a dos integrantes distintos en la cuadrícula.')
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

  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 pb-16">
      <SiteHeader subtitle="Enamora2 — anónimo, infinito y un poco cruel." />
      <div className="mb-4 text-center">
        <Link to="/" className="text-sm text-pink-100 underline-offset-4 hover:underline">
          Volver a actividades
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <GlassCard className="overflow-hidden">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:justify-center md:gap-8">
            <PartnerSlot label="Integrante A" member={left} onClear={() => setLeftId('')} />

            <div className="flex flex-col items-center">
              <LoveThermometer percent={result?.percent ?? 0} animate={Boolean(result)} />
              <p className="font-pixel mt-3 text-[10px] text-pink-50">
                {result ? `${result.percent}%` : '0%'}
              </p>
            </div>

            <PartnerSlot label="Integrante B" member={right} onClear={() => setRightId('')} />
          </div>

          {result ? (
            <motion.p
              className="font-display mx-auto mt-6 max-w-lg text-center text-3xl text-pink-50"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result.phrase}
            </motion.p>
          ) : (
            <p className="mt-6 text-center text-sm text-pink-100/70">
              Toca dos fotos abajo. El termómetro espera vacío hasta Continuar.
            </p>
          )}

          {error ? <p className="mt-4 text-center text-sm text-rose-100">{error}</p> : null}

          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-400 px-8 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(255,77,148,0.35)] disabled:opacity-50"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continuar
            </button>
            {result ? (
              <button
                type="button"
                className="rounded-2xl border border-pink-100/20 px-5 py-3 text-sm text-pink-50"
                onClick={() => setResult(null)}
              >
                Otra ronda
              </button>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="mb-3 text-center text-sm font-semibold text-pink-100">
              Elige a la pareja
            </p>
            <div className="custom-scroll grid max-h-[22rem] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
              {members.map((member) => {
                const selected = member.id === leftId || member.id === rightId
                const slot = member.id === leftId ? 'A' : member.id === rightId ? 'B' : ''

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => pickMember(member.id)}
                    className={`glass overflow-hidden rounded-2xl text-left transition ${
                      selected ? 'ring-2 ring-pink-300/80' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="relative block aspect-square overflow-hidden">
                      <img
                        src={getMemberImage(member.name, member.image)}
                        alt={member.name}
                        className="h-full w-full object-cover object-center"
                      />
                      {slot ? (
                        <span className="absolute top-2 right-2 rounded-full bg-pink-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                          {slot}
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate px-2 py-2 text-center text-xs font-semibold text-pink-50">
                      {member.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
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
