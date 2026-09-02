import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { INITIAL_MEMBERS } from '../constants/members'
import { db } from '../firebase'

export function memberDocId(name) {
  return (
    String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'member'
  )
}

/** Keep one card per name in the UI. */
export function uniqueMembersByName(members) {
  const seen = new Set()
  return members.filter((member) => {
    const key = String(member.name || '').trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Seed members with stable IDs (idempotent) and delete any name duplicates
 * left over from earlier double-seeding / StrictMode races.
 */
export async function syncMembersCollection() {
  if (!db) return

  await Promise.all(
    INITIAL_MEMBERS.map((member) =>
      setDoc(
        doc(db, 'members', memberDocId(member.name)),
        {
          name: member.name,
          image: member.image,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  )

  const snapshot = await getDocs(collection(db, 'members'))
  const keepByName = new Map()
  const deleteIds = []

  for (const item of snapshot.docs) {
    const name = String(item.data().name || '').trim()
    const key = name.toLowerCase()
    if (!key) {
      deleteIds.push(item.id)
      continue
    }

    const preferredId = memberDocId(name)
    const current = keepByName.get(key)

    if (!current) {
      keepByName.set(key, item)
      continue
    }

    if (item.id === preferredId && current.id !== preferredId) {
      deleteIds.push(current.id)
      keepByName.set(key, item)
    } else {
      deleteIds.push(item.id)
    }
  }

  await Promise.all(deleteIds.map((id) => deleteDoc(doc(db, 'members', id))))
}
