import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { withMemberImages } from '../constants/members'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { setActivityEnabled } from '../lib/activities'
import {
  memberDocId,
  syncMembersCollection,
  uniqueMembersByName,
} from '../lib/membersSync'
import useActivities from '../hooks/useActivities'

const ADMIN_SESSION_KEY = 'multi-aquarium-admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
const USE_FIREBASE_AUTH = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true'

function formatDate(value) {
  if (!value?.toDate) return 'Hace un momento'
  return value.toDate().toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1',
  )
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState('letters')
  const [letters, setLetters] = useState([])
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const { activities } = useActivities()

  useEffect(() => {
    if (!unlocked || !db) return undefined

    const lettersUnsub = onSnapshot(
      query(collection(db, 'letters'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setLetters(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      },
    )

    const membersUnsub = onSnapshot(
      query(collection(db, 'members'), orderBy('name')),
      (snapshot) => {
        setMembers(
          uniqueMembersByName(
            withMemberImages(
              snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            ),
          ),
        )
      },
    )

    return () => {
      lettersUnsub()
      membersUnsub()
    }
  }, [unlocked])

  const missingConfig = !isFirebaseConfigured || !db

  async function handleUnlock(event) {
    event.preventDefault()
    setAuthError('')

    try {
      if (USE_FIREBASE_AUTH) {
        if (!auth || !ADMIN_EMAIL) {
          throw new Error('Firebase Auth no está configurado.')
        }
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
      } else if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
        setAuthError('La contraseña no abre esta esclusa.')
        return
      }

      sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
      setUnlocked(true)
      setPassword('')
    } catch {
      setAuthError('No se pudo entrar al panel. Revisa las credenciales.')
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setUnlocked(false)
    if (USE_FIREBASE_AUTH && auth) {
      await signOut(auth)
    }
  }

  async function addMember(event) {
    event.preventDefault()
    const name = newMember.trim()
    if (!name || !db) return

    setBusy(true)
    setNotice('')
    try {
      await setDoc(
        doc(db, 'members', memberDocId(name)),
        {
          name,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
      setNewMember('')
    } catch (error) {
      console.error(error)
      setNotice('No se pudo agregar el integrante.')
    } finally {
      setBusy(false)
    }
  }

  async function removeMember(id) {
    if (!db) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'members', id))
    } catch (error) {
      console.error(error)
      setNotice('No se pudo eliminar el integrante.')
    } finally {
      setBusy(false)
    }
  }

  async function seedMembers() {
    if (!db) return
    setBusy(true)
    setNotice('')
    try {
      await syncMembersCollection()
      setNotice('Lista sincronizada: 19 integrantes únicos (duplicados eliminados).')
    } catch (error) {
      console.error(error)
      setNotice('No se pudo cargar la lista inicial.')
    } finally {
      setBusy(false)
    }
  }

  async function removeLetter(id) {
    if (!db) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'letters', id))
    } catch (error) {
      console.error(error)
      setNotice('No se pudo archivar la carta.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActivity(id, enabled) {
    setBusy(true)
    setNotice('')
    try {
      await setActivityEnabled(id, enabled)
    } catch (error) {
      console.error(error)
      setNotice('No se pudo actualizar la actividad.')
    } finally {
      setBusy(false)
    }
  }

  const tabs = useMemo(
    () => [
      { id: 'letters', label: 'Buzón de Cartas' },
      { id: 'members', label: 'Gestión de Integrantes' },
      { id: 'activities', label: 'Actividades' },
    ],
    [],
  )

  if (!unlocked) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-16">
        <GlassCard className="w-full">
          <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/80 uppercase">
            Zona oculta
          </p>
          <h1 className="font-display mt-2 text-4xl text-cyan-50">Panel del Acuario</h1>
          <p className="mt-2 text-sm text-sky-100/75">
            Solo quienes conocen la clave pueden ver las cartas y cuidar a los integrantes.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
            <input
              type="password"
              className="glass-input"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {authError ? <p className="text-sm text-rose-200">{authError}</p> : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-500 px-5 py-3 font-semibold text-white"
            >
              Entrar
            </button>
          </form>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/80 uppercase">
            Administrador
          </p>
          <h1 className="font-display text-4xl text-cyan-50">Panel secreto del acuario</h1>
        </div>
        <button
          type="button"
          className="rounded-full border border-cyan-100/20 bg-white/5 px-4 py-2 text-sm text-cyan-50"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>

      {missingConfig ? (
        <p className="mb-4 rounded-2xl border border-amber-200/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Firebase no está configurado. Completa el archivo .env para usar el panel.
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === item.id
                ? 'bg-cyan-300/25 text-white'
                : 'bg-white/5 text-cyan-100/80 hover:bg-white/10'
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice ? <p className="mb-4 text-sm text-cyan-100/80">{notice}</p> : null}

      <AnimatePresence mode="wait">
        {tab === 'activities' ? (
          <motion.section
            key="activities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {activities.map((activity) => (
              <GlassCard key={activity.id} className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-cyan-50">{activity.title}</h2>
                  <p className="text-sm text-sky-100/75">{activity.description}</p>
                  <p className="mt-1 text-xs text-cyan-200/70">{activity.path}</p>
                </div>
                <button
                  type="button"
                  className="activity-toggle"
                  data-on={activity.enabled ? 'true' : 'false'}
                  onClick={() => toggleActivity(activity.id, !activity.enabled)}
                  disabled={busy}
                  aria-pressed={activity.enabled}
                  aria-label={`Alternar ${activity.title}`}
                >
                  <span />
                </button>
              </GlassCard>
            ))}
          </motion.section>
        ) : tab === 'letters' ? (
          <motion.section
            key="letters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {letters.length === 0 ? (
              <GlassCard>
                <p className="text-sky-100/75">Todavía no hay cartas en el buzón.</p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {letters.map((letter) => (
                  <GlassCard key={letter.id} className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-wide text-cyan-200/70 uppercase">
                          {formatDate(letter.createdAt)}
                        </p>
                        <h2 className="font-display text-2xl text-cyan-50">
                          Para {letter.recipientName}
                        </h2>
                        <p className="text-sm text-sky-100/80">De {letter.sender}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-rose-200/80 hover:text-rose-100"
                        onClick={() => removeLetter(letter.id)}
                        disabled={busy}
                      >
                        Archivar
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sky-50/90">{letter.message}</p>
                    {letter.imageUrl ? (
                      <img
                        src={letter.imageUrl}
                        alt={`Adjunto de ${letter.sender}`}
                        className="max-h-64 w-full rounded-2xl object-cover object-center"
                      />
                    ) : null}
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <GlassCard className="mb-4">
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={addMember}>
                <input
                  className="glass-input"
                  placeholder="Nombre del integrante"
                  value={newMember}
                  onChange={(event) => setNewMember(event.target.value)}
                  disabled={busy}
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-500 px-5 py-3 font-semibold whitespace-nowrap text-white"
                  disabled={busy}
                >
                  Agregar
                </button>
              </form>
              <button
                type="button"
                className="mt-4 text-sm text-cyan-200 underline-offset-4 hover:underline"
                onClick={seedMembers}
                disabled={busy}
              >
                Sincronizar lista (19 únicos, sin duplicados)
              </button>
            </GlassCard>

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="glass flex items-center justify-between rounded-2xl px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="avatar-ring h-11 w-11 overflow-hidden rounded-full">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-cyan-900/50 text-sm">
                          {member.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="truncate font-medium text-cyan-50">{member.name}</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-rose-400/15 px-3 py-1 text-sm text-rose-100 hover:bg-rose-400/25"
                    onClick={() => removeMember(member.id)}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
