import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { INITIAL_MEMBERS, withMemberImages } from '../constants/members'
import { db, isFirebaseConfigured } from '../firebase'
import { syncMembersCollection, uniqueMembersByName } from '../lib/membersSync'

function localMembersFallback() {
  return withMemberImages(
    INITIAL_MEMBERS.map((member) => ({
      id: `local-${member.name}`,
      name: member.name,
      image: member.image,
    })),
  )
}

export default function useMembers() {
  const [members, setMembers] = useState(localMembersFallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return undefined
    }

    let unsubscribe = () => {}
    let cancelled = false

    async function start() {
      try {
        await syncMembersCollection()
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError('No se pudieron sincronizar los integrantes.')
          setMembers(localMembersFallback())
          setLoading(false)
        }
        return
      }

      if (cancelled) return

      unsubscribe = onSnapshot(
        query(collection(db, 'members'), orderBy('name')),
        (snapshot) => {
          const next = uniqueMembersByName(
            withMemberImages(
              snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            ),
          )
          setMembers(next)
          setLoading(false)
          setError('')
        },
        (err) => {
          console.error(err)
          setError('No se pudieron cargar los integrantes.')
          setMembers(localMembersFallback())
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

  return { members, loading, error }
}
