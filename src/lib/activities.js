import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { ACTIVITIES } from '../constants/activities'
import { db } from '../firebase'

export async function syncActivitiesCollection() {
  if (!db) return

  await Promise.all(
    ACTIVITIES.map(async (activity) => {
      const ref = doc(db, 'activities', activity.id)
      const snapshot = await getDoc(ref)
      const payload = {
        title: activity.title,
        path: activity.path,
        description: activity.description,
      }

      if (!snapshot.exists()) {
        payload.enabled = activity.enabled
      }

      await setDoc(ref, payload, { merge: true })
    }),
  )
}

export function listenActivities(onChange, onError) {
  if (!db) {
    onChange(ACTIVITIES)
    return () => {}
  }

  return onSnapshot(
    collection(db, 'activities'),
    (snapshot) => {
      const remote = Object.fromEntries(
        snapshot.docs.map((item) => [item.id, item.data()]),
      )
      const merged = ACTIVITIES.map((activity) => ({
        ...activity,
        ...remote[activity.id],
        id: activity.id,
        path: activity.path,
        title: remote[activity.id]?.title || activity.title,
        description: remote[activity.id]?.description || activity.description,
        enabled:
          typeof remote[activity.id]?.enabled === 'boolean'
            ? remote[activity.id].enabled
            : activity.enabled,
      }))
      onChange(merged)
    },
    onError,
  )
}

export async function setActivityEnabled(id, enabled) {
  if (!db) return
  await setDoc(doc(db, 'activities', id), { enabled }, { merge: true })
}
