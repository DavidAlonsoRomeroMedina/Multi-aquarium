import { useEffect, useState } from 'react'
import { db, isFirebaseConfigured } from '../firebase'
import { listenGift } from '../lib/gift'

export default function useGift() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setEnabled(true)
      setLoading(false)
      return undefined
    }

    const timeout = window.setTimeout(() => setLoading(false), 1200)

    const unsubscribe = listenGift(
      (gift) => {
        setEnabled(gift.enabled)
        setLoading(false)
        window.clearTimeout(timeout)
      },
      (error) => {
        console.error(error)
        setEnabled(true)
        setLoading(false)
        window.clearTimeout(timeout)
      },
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  return { enabled, loading }
}
