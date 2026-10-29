import { useState } from 'react'
import { Link } from 'react-router-dom'
import NightSky from '../components/NightSky'
import useGift from '../hooks/useGift'
import { setGiftEnabled } from '../lib/gift'
import { isFirebaseConfigured } from '../firebase'

const ADMIN_SESSION_KEY = 'carta-abril-admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1',
  )
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const { enabled, loading } = useGift()

  function handleUnlock(event) {
    event.preventDefault()
    setAuthError('')

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      setAuthError('Esa clave no abre esta puerta.')
      return
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    setUnlocked(true)
    setPassword('')
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setUnlocked(false)
  }

  async function toggleGift() {
    setBusy(true)
    setNotice('')
    try {
      await setGiftEnabled(!enabled)
      setNotice(enabled ? 'La carta quedó en pausa.' : 'La carta ya está encendida.')
    } catch (error) {
      console.error(error)
      setNotice(
        'No se pudo guardar. Publica las reglas nuevas de Firestore o revisa Firebase.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <NightSky />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-16">
        <div className="paper w-full rounded-3xl px-6 py-8 sm:px-8">
          {!unlocked ? (
            <>
              <p className="text-xs font-semibold tracking-[0.28em] text-rose-800/70 uppercase">
                Solo tú
              </p>
              <h1 className="font-display mt-2 text-4xl text-rose-950">Llave de la carta</h1>
              <p className="mt-2 text-sm text-rose-900/70">
                Desde aquí puedes encender o pausar el regalo de Abril.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
                <input
                  type="password"
                  className="gift-input"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {authError ? <p className="text-sm text-rose-700">{authError}</p> : null}
                <button type="submit" className="gift-button">
                  Entrar
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.28em] text-rose-800/70 uppercase">
                    Control
                  </p>
                  <h1 className="font-display mt-1 text-3xl text-rose-950">Regalo de Abril</h1>
                </div>
                <button
                  type="button"
                  className="text-sm text-rose-800/70 underline-offset-4 hover:underline"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>

              <p className="mt-4 text-sm text-rose-900/75">
                {loading
                  ? 'Leyendo el estado…'
                  : enabled
                    ? 'La carta está encendida. Abril verá el sobre al abrir el link.'
                    : 'La carta está en pausa. Ella verá un aviso de “aún no es el momento”.'}
              </p>

              {!isFirebaseConfigured ? (
                <p className="mt-3 rounded-2xl bg-amber-100/80 px-3 py-2 text-sm text-amber-950">
                  Firebase no está configurado en este deploy. El regalo se muestra
                  encendido por defecto.
                </p>
              ) : null}

              <button
                type="button"
                className="gift-button mt-6"
                onClick={toggleGift}
                disabled={busy || loading}
              >
                {enabled ? 'Pausar la carta' : 'Encender la carta'}
              </button>

              {notice ? <p className="mt-3 text-sm text-rose-800/80">{notice}</p> : null}

              <div className="mt-8 space-y-2 text-sm text-rose-900/70">
                <p>
                  Para cambiar el texto: edita src/constants/letter.js y haz git
                  push.
                </p>
                <p>
                  Para publicar cambios: git add, git commit y git push a main.
                  Vercel actualiza el link solo.
                </p>
              </div>

              <Link
                to="/"
                className="mt-6 inline-block text-sm text-rose-800 underline-offset-4 hover:underline"
              >
                Ver lo que verá Abril
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
