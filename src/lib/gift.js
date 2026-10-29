import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const GIFT_REF = () => doc(db, 'gift', 'config')

export function listenGift(onChange, onError) {
  if (!db) {
    onChange({ enabled: true })
    return () => {}
  }

  return onSnapshot(
    GIFT_REF(),
    (snapshot) => {
      const data = snapshot.data()
      onChange({
        enabled: data?.enabled !== false,
      })
    },
    onError,
  )
}

export async function setGiftEnabled(enabled) {
  if (!db) {
    throw new Error('Firebase no está configurado.')
  }
  await setDoc(GIFT_REF(), { enabled }, { merge: true })
}
