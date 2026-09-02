import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function readEnv(...keys) {
  for (const key of keys) {
    const value = String(import.meta.env[key] ?? '').trim()
    if (value) return value
  }
  return ''
}

const firebaseConfig = {
  // WEB_KEY is preferred; API_KEY kept as fallback for older Vercel configs.
  apiKey: readEnv('VITE_FIREBASE_WEB_KEY', 'VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

export const firebaseEnvStatus = {
  hasWebKey: Boolean(firebaseConfig.apiKey),
  hasProjectId: Boolean(firebaseConfig.projectId),
  hasAppId: Boolean(firebaseConfig.appId),
  hasAuthDomain: Boolean(firebaseConfig.authDomain),
}

export const isFirebaseConfigured = Boolean(
  firebaseEnvStatus.hasWebKey &&
    firebaseEnvStatus.hasProjectId &&
    firebaseEnvStatus.hasAppId,
)

export function getFirebaseConfigError() {
  if (isFirebaseConfigured) return ''

  const missing = []
  if (!firebaseEnvStatus.hasWebKey) {
    missing.push('VITE_FIREBASE_WEB_KEY')
  }
  if (!firebaseEnvStatus.hasProjectId) {
    missing.push('VITE_FIREBASE_PROJECT_ID')
  }
  if (!firebaseEnvStatus.hasAppId) {
    missing.push('VITE_FIREBASE_APP_ID')
  }

  return `Firebase no está configurado en este deploy. Faltan: ${missing.join(', ')}. En Vercel deben estar en Production y hay que Redeploy (sin caché).`
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
