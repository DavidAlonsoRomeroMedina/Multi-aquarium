import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoveThermometer from '../components/LoveThermometer'
import SiteHeader from '../components/SiteHeader'
import { isExtremeLoveScore, phraseForLovePercent } from '../constants/lovePhrases'
import { getMemberImage } from '../constants/members'
import { db, isFirebaseConfigured } from '../firebase'
import useMembers from '../hooks/useMembers'

function PartnerSlot({ label, member, onClear }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 sm:gap-2">
      <span className="avatar-ring h-14 w-14 overflow-hidden rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28">
        {member ? (
          <img
            src={getMemberImage(member.name, member.image)}
            alt={member.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg text-pink-100/80 sm:text-2xl">
            ?
          </span>
        )}
      </span>
      <p className="text-[9px] font-semibold tracking-wide text-pink-50 uppercase drop-shadow sm:text-xs">
        {label}
      </p>
      <p className="max-w-full truncate text-center text-[11px] font-semibold text-white drop-shadow sm:min-h-6 sm:text-base">
        {member?.name || 'Pendiente'}
      </p>
      {member ? (
        <button
          type="button"
          className="text-[10px] text-pink-100/80 hover:text-white sm:text-xs"
          onClick={onClear}
        >
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
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden px-3 pb-16 sm:px-4">
      <div className="enamora-bg" aria-hidden="true" />

      <SiteHeader subtitle="Enamora2 — anónimo, infinito y un poco cruel." />
      <div className="mb-4 text-center">
        <Link to="/" className="text-sm text-pink-50 underline-offset-4 drop-shadow hover:underline">
          Volver a actividades
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="glass-pink overflow-hidden rounded-3xl p-3 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center justify-center gap-1 sm:gap-6">
            <PartnerSlot label="Integrante A" member={left} onClear={() => setLeftId('')} />

            <div className="flex flex-col items-center justify-center">
              <LoveThermometer percent={result?.percent ?? 0} animate={Boolean(result)} />
              <p className="font-pixel mt-2 text-[9px] text-white drop-shadow sm:mt-3 sm:text-[10px]">
                {result ? `${result.percent}%` : '0%'}
              </p>
            </div>

            <PartnerSlot label="Integrante B" member={right} onClear={() => setRightId('')} />
          </div>

          {result ? (
            <motion.p
              className="font-display mx-auto mt-5 max-w-lg text-center text-2xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:mt-6 sm:text-3xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result.phrase}
            </motion.p>
          ) : (
            <p className="mt-5 text-center text-xs text-pink-50 drop-shadow sm:mt-6 sm:text-sm">
              Toca dos fotos abajo. El termómetro espera vacío hasta Continuar.
            </p>
          )}

          {error ? <p className="mt-4 text-center text-sm text-rose-100">{error}</p> : null}

          <div className="mt-5 flex justify-center gap-3 sm:mt-6 sm:gap-4">
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-400 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,77,148,0.35)] disabled:opacity-50 sm:px-8 sm:py-3 sm:text-base"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continuar
            </button>
            {result ? (
              <button
                type="button"
                className="rounded-2xl border border-pink-200/40 bg-pink-300/10 px-4 py-2.5 text-sm text-white sm:px-5 sm:py-3"
                onClick={() => setResult(null)}
              >
                Otra ronda
              </button>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="mb-3 text-center text-sm font-semibold text-pink-50">Elige a la pareja</p>
            <div className="custom-scroll grid max-h-[22rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
              {members.map((member) => {
                const selected = member.id === leftId || member.id === rightId
                const slot = member.id === leftId ? 'A' : member.id === rightId ? 'B' : ''

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => pickMember(member.id)}
                    className={`overflow-hidden rounded-2xl border border-pink-200/25 bg-pink-300/10 text-left transition ${
                      selected ? 'ring-2 ring-pink-300/90' : 'hover:bg-pink-300/20'
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
                    <span className="block truncate px-2 py-2 text-center text-xs font-semibold text-white">
                      {member.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside>
          <section className="glass-pink rounded-3xl p-5 lg:sticky lg:top-6">
            <h2 className="font-display text-2xl text-white drop-shadow">Registro extremo</h2>
            <p className="mt-1 mb-4 text-xs text-pink-50">Solo se publican 0–10% y 90–100%.</p>
            <div className="custom-scroll max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-pink-50">Aún no hay destinos extremos.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-pink-200/25 bg-pink-400/15 p-3">
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
                      <span className="font-pixel text-[10px] text-white">{item.percent}%</span>
                    </div>
                    <p className="mt-2 text-sm text-white">
                      {item.leftName} + {item.rightName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
