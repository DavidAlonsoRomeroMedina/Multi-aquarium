import { useEffect, useState } from 'react'
import { ACTIVITIES } from '../constants/activities'
import { db, isFirebaseConfigured } from '../firebase'
import { listenActivities, syncActivitiesCollection } from '../lib/activities'

export default function useActivities() {
  const [activities, setActivities] = useState(ACTIVITIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    let unsubscribe = () => {}

    async function start() {
      try {
        await syncActivitiesCollection()
      } catch (error) {
        console.error(error)
      }

      if (cancelled) return

      unsubscribe = listenActivities(
        (next) => {
          setActivities(next)
          setLoading(false)
        },
        (error) => {
          console.error(error)
          setActivities(ACTIVITIES)
          setLoading(false)
        },
      )
    }

    start()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return { activities, loading }
}
