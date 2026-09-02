import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import LetterForm from '../components/LetterForm'
import SiteHeader from '../components/SiteHeader'
import SuccessMessage from '../components/SuccessMessage'
import { db, isFirebaseConfigured } from '../firebase'

export default function HomePage() {
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [sent, setSent] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoadError('Configura Firebase en el archivo .env para activar el acuario.')
      setLoadingMembers(false)
      return undefined
    }

    const membersQuery = query(collection(db, 'members'), orderBy('name'))

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        setMembers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoadingMembers(false)
      },
      (error) => {
        console.error(error)
        setLoadError('No se pudieron cargar los integrantes.')
        setLoadingMembers(false)
      },
    )

    return unsubscribe
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
              className="w-full max-w-xl"
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
