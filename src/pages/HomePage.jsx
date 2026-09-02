import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import LetterForm from '../components/LetterForm'
import SiteHeader from '../components/SiteHeader'
import SuccessMessage from '../components/SuccessMessage'
import { INITIAL_MEMBERS, withMemberImages } from '../constants/members'
import { db, isFirebaseConfigured } from '../firebase'
import { syncMembersCollection, uniqueMembersByName } from '../lib/membersSync'

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function localMembersFallback() {
  return INITIAL_MEMBERS.map((member) => ({
    id: `local-${member.name}`,
    name: member.name,
    image: member.image,
  }))
}

export default function HomePage() {
  const [members, setMembers] = useState(() => withMemberImages(localMembersFallback()))
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [sent, setSent] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoadError('Configura Firebase en el archivo .env para activar el acuario.')
      setLoadingMembers(false)
      return undefined
    }

    let unsubscribe = () => {}
    let cancelled = false

    async function start() {
      try {
        await withTimeout(
          syncMembersCollection(),
          20000,
          'Firestore tardó demasiado. ¿Está creada la base y publicadas las reglas?',
        )
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setLoadError(
            error.message ||
              'No se pudieron preparar los integrantes. Revisa Firestore (base creada + reglas).',
          )
          setMembers(withMemberImages(localMembersFallback()))
          setLoadingMembers(false)
        }
        return
      }

      if (cancelled) return

      const membersQuery = query(collection(db, 'members'), orderBy('name'))
      unsubscribe = onSnapshot(
        membersQuery,
        (snapshot) => {
          const next = uniqueMembersByName(
            withMemberImages(
              snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            ),
          )
          setMembers(next.length ? next : withMemberImages(localMembersFallback()))
          setLoadingMembers(false)
          setLoadError('')
        },
        (error) => {
          console.error(error)
          setLoadError('No se pudieron cargar los integrantes desde Firestore.')
          setMembers(withMemberImages(localMembersFallback()))
          setLoadingMembers(false)
        },
      )
    }

    start()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-16">
      <SiteHeader />

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
              {loadError ? (
                <p className="mb-4 rounded-2xl border border-amber-200/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  {loadError}
                </p>
              ) : null}
              {loadingMembers ? (
                <p className="mb-4 text-center text-sm text-cyan-100/70">
                  Cargando integrantes del acuario…
                </p>
              ) : null}
              {!loadingMembers && !loadError && members.length === 0 ? (
                <p className="mb-4 rounded-2xl border border-cyan-100/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
                  Aún no hay destinatarios. Entra al panel oculto y carga la lista de integrantes.
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
